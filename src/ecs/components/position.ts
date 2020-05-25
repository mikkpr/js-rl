import { BaseComponent } from 'ecs-machina';

export interface Position extends BaseComponent {
  x: number;
  y: number;
}

export const Position = 'Position';

export const isPosition = (cmp: BaseComponent): cmp is Position => {
  return cmp._type === Position;
}
