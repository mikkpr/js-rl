import { BaseComponent } from 'ecs-machina';

export interface Camera extends BaseComponent {
  active: boolean;
}

export const Camera = 'Camera';

export const isCamera = (cmp: BaseComponent): cmp is Camera => {
  return cmp._type === Camera;
}
