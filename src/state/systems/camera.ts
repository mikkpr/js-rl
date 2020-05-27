import { BaseComponent, System } from 'ecs-machina';
import state from '..';

import {
  Camera,
  isCamera, 
  Position,
  isPosition 
} from '../components';

export class CameraSystem extends System { 
  public requiredComponents = [Camera, Position]; 

  public updateEntity(entity: string, components: BaseComponent[]): void {
    const position = components.find(isPosition);
    const camera = components.find(isCamera);
    if (camera.active) {
      state.setCamera(position.x, position.y);
    }
  }
}
