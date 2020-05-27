import { BaseComponent } from 'ecs-machina';

export interface Viewshed extends BaseComponent {
  exploredCells: Set<number>;
  visibleCells: Set<number>;
  range: number;
  dirty: boolean;
}

export const Viewshed = 'Viewshed';

export const isViewshed = (cmp: BaseComponent): cmp is Viewshed => {
  return cmp._type === Viewshed;
}
