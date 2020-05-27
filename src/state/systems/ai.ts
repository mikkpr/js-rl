import Alea from 'alea';

import { BaseComponent, System } from 'ecs-machina';
import { WorldWithRNG } from '..';
import state from '..';

import {
  Intent,
  AI,
  isAI,
  isPosition
} from '../components';

export class AISystem extends System {  
  public requiredComponents = [AI];

  public updateEntity(entity: string, components: BaseComponent[]): void {
    const AI = components.find(isAI);

    let intent;
    for (const AIType of AI.ai) {
      if (AIType === 'AVOID_PLAYER') {
        const range = 5;
        const playerID = state.getState().player;
        const playerPos = this.world.getComponents(playerID).find(isPosition);
        const entityPos = this.world.getComponents(entity).find(isPosition);
        const dx = playerPos.x - entityPos.x;
        const dy = playerPos.y - entityPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= range) {
          const vector = [dx ? -dx / Math.abs(dx) : 0, dy ? -dy / Math.abs(dy) : 0];
          this.world.registerComponent(entity, {
            _type: Intent,
            intent: 'MOVE',
            payload: {
              dx: vector[0],
              dy: vector[1],
            }
          } as Intent);
          break;
        }
      } else if (AIType === 'RANDOM_WALK') {
        const rng = (this.world as WorldWithRNG).rng;
        if (Math.abs(rng()) > 0.75) {

          const dx = [-1, 0, 1][Math.round(rng() * 2)];
          const dy = [-1, 0, 1][Math.round(rng() * 2)];
          this.world.registerComponent(entity, {
            _type: Intent,
            intent: 'MOVE',
            payload: {
              dx, dy
            }
          } as Intent);
        }
      }
    } 
  }
}
