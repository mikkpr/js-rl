import { BaseComponent, System } from 'ecs-machina';
import state from '..';

import {
  Position,
  isPosition,
  Viewshed,
  isViewshed,
} from '../components';

export class VisibilitySystem extends System {  
  public requiredComponents = [Viewshed, Position];

  public updateEntity(entity: string, components: BaseComponent[]): void {
    const viewshed = components.find(isViewshed);
    if (!viewshed.dirty) { return; }

    const position = components.find(isPosition);

    viewshed.visibleCells.clear();
    state.map.fov.compute(position.x, position.y, viewshed.range, state.map.isTransparent, (x, y) => {
      const idx = state.map.getIdx(x, y);
      if (idx == null) { return; }
      viewshed.visibleCells.add(idx);
      viewshed.exploredCells.add(idx);
    });
    viewshed.dirty = false;
  }
}
