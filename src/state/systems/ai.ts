import Alea from 'alea';
import { match } from 'egna';
import { BaseComponent, System } from 'ecs-machina';
import { handleAttack } from './intent';
import { MyWorld } from '..';
import state from '..';

import {
  Intent,
  AI,
  isAI,
  isPosition,
  Viewshed,
  isViewshed,
  isHealth
} from '../components';

export class AISystem extends System {  
  public requiredComponents = [AI, Viewshed];

  updateEntity = (entity: string, components: BaseComponent[]): void => {
    const ai = components.find(isAI);
    const intents = ai.ai.map(type => {
      switch(type) {
        case 'AGGRESS':
          return handleAggress(entity, components);
        case 'RETALIATE':
          return handleRetaliate(entity, components);
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
  const rng = (state.world as MyWorld).rng;
  if (Math.abs(rng()) > 0.75) {

    const dx = [-1, 0, 1][Math.round(rng() * 2)];
    const dy = [-1, 0, 1][Math.round(rng() * 2)];

    if (dx === 0 && dy === 0) { return; }

    return {
      _type: Intent,
      intent: 'MOVE',
      payload: {
        dx, dy
      }
    } as Intent;
  }
};

const handleRetaliate = (entity, components) => {
  const health = components.find(isHealth);
  if (!health || !health.lastAttacker) { return; }

  const attacker = health.lastAttacker;
  const position = components.find(isPosition);
  const viewshed = components.find(isViewshed);
  const attackerPosition = state.world.getComponents(attacker).find(isPosition);
  const inRange = Math.abs(attackerPosition.x - position.x) <= 1 && Math.abs(attackerPosition.y - position.y) <= 1;
  if (!inRange || !viewshed || !viewshed.visibleCells.has(state.map.getIdx(position.x, position.y))) { return; }
 
  return {
    _type: Intent,
    intent: 'ATTACK',
    payload: {
      target: attacker 
    }
  } as Intent;
}

const handleAggress = (entity, components) => {
  const target = state.getState().player;
  const position = components.find(isPosition);
  const viewshed = components.find(isViewshed);
  const targetPos = state.world.getComponents(target).find(isPosition);
  const inRange = Math.abs(targetPos.x - position.x) <= 1 && Math.abs(targetPos.y - position.y) <= 1;
  if (!inRange || !viewshed || !viewshed.visibleCells.has(state.map.getEntityLocation(target))) { return; }
 
  return {
    _type: Intent,
    intent: 'ATTACK',
    payload: {
      target: target 
    }
  } as Intent;


}
