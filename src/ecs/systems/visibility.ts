import * as ROT from 'rot-js';
import { System } from 'ecsy';
import { Position, Renderable, Viewshed } from '../components';
import { game } from '../..';
import { xyIdx, lightPasses } from '../../map';

const FOV = new ROT.FOV.RecursiveShadowcasting((x, y) => {
  const map = game.getState().map;
  const idx = xyIdx(x, y);
  return !lightPasses(map, idx);
});

class VisibilitySystem extends System {
  execute(delta: number, time: number): void {
    this.queries.visibles.results.forEach(entity => {
      const { x, y } = entity.getComponent(Position);
      const viewshed = entity.getMutableComponent(Viewshed);
      if (viewshed.dirty) {
        let visibleTiles = [];
        FOV.compute(x, y, viewshed.range, (x, y, r, visibility) => {
          visibleTiles.push(xyIdx(x, y));
          viewshed.exploredTiles.add(xyIdx(x, y));
        });
        viewshed.dirty = false
        viewshed.visibleTiles = visibleTiles;
      }
    });
  }
}

VisibilitySystem.queries = {
  visibles: { components: [ Position, Viewshed ]}
};

export default VisibilitySystem;
