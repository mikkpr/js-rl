import Alea from 'alea';
import { match } from 'egna';
import { BaseComponent, System } from 'ecs-machina';
import { WorldWithRNG } from '..';
import state from '..';

import {
  Intent,
  AI,
  isAI,
  isPosition,
  Viewshed,
  isViewshed
} from '../components';

export class AISystem extends System {  
  public requiredComponents = [AI, Viewshed];

  updateEntity = (entity: string, components: BaseComponent[]): void => {
    const ai = components.find(isAI);
    const intents = ai.ai.map(type => {
      switch(type) {
        case 'AVOID_PLAYER':
          return handleAvoidPlayer(entity, components);
        case 'RANDOM_WALK':
          return handleRandomWalk(entity, components);
        default:
          return null;
      }
    });
    for (let intent of intents) {
      if (intent) { 
        this.world.registerComponent(entity, intent);
        break;
      }
    } 
  }
}

const handleAvoidPlayer = (entity, components) => {
  const viewshed = components.find(isViewshed);
  const range = 5;
  const playerID = state.getState().player;
  const playerPos = state.world.getComponents(playerID).find(isPosition);
  const playerIdx = state.map.getIdx(playerPos.x, playerPos.y);
  if (viewshed.visibleCells.has(playerIdx)) {
    const entityPos = state.world.getComponents(entity).find(isPosition);
    const dx = playerPos.x - entityPos.x;
    const dy = playerPos.y - entityPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist <= range) {
      const vector = [dx ? -dx / Math.abs(dx) : 0, dy ? -dy / Math.abs(dy) : 0];
      return {
        _type: Intent,
        intent: 'MOVE',
        payload: {
          dx: vector[0],
          dy: vector[1],
        }
      } as Intent;
    } 
  }
};

const handleRandomWalk = (entity, components) => {
  const rng = (state.world as WorldWithRNG).rng;
  if (Math.abs(rng()) > 0.75) {

    const dx = [-1, 0, 1][Math.round(rng() * 2)];
    const dy = [-1, 0, 1][Math.round(rng() * 2)];

    return {
      _type: Intent,
      intent: 'MOVE',
      payload: {
        dx, dy
      }
    } as Intent;
  }
};
