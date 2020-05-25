import { BaseComponent, System } from 'ecs-machina';
import { WIDTH, HEIGHT } from '../../constants';

import {
  Intent,
  isIntentOfType, 
  Position,
  isPosition 
} from '../components';

export class MovementSystem extends System { 
  public requiredComponents = [Intent, Position];

  public updateEntity(entity: string, components: BaseComponent[]): void {
    const movementIntent = components.find(isIntentOfType('MOVE'));
    const position = components.find(isPosition);

    position.x = Math.min(Math.max(0, position.x + movementIntent.payload.dx), WIDTH - 1);
    position.y = Math.min(Math.max(0, position.y + movementIntent.payload.dy), HEIGHT - 1);

    this.world.removeComponentByType(entity, Intent);
  }
}
