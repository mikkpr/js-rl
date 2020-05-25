import Alea from 'alea';

import { BaseComponent, System } from 'ecs-machina';
import { WorldWithRNG } from '..';

import {
  Intent,
  AI,
  isAI 
} from '../components';

export class AISystem extends System {  
  public requiredComponents = [AI];

  public updateEntity(entity: string, components: BaseComponent[]): void {
    const AI = components.find(isAI);

    if (AI.ai === 'RANDOM_WALK') {
      const rng = (this.world as WorldWithRNG).rng;
      if (Math.abs(rng()) > 0.95) {

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
