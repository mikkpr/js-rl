import * as ROT from 'rot-js';
import { System } from 'ecsy';
import { Light, Position, Viewshed } from '../components';
import { game } from '../..';
import { xyIdx, lightPasses } from '../../map';

const FOV = new ROT.FOV.RecursiveShadowcasting((x, y) => {
  const map = game.getState().map;
  const idx = xyIdx(x, y);
  return lightPasses(map, idx);
}, {
  topology: 4
});

const getLighting = (range, color, x, y) => {
  const lighting = new ROT.Lighting((x, y) => {
    const map = game.getState().map;
    const idx = xyIdx(x, y);
    return lightPasses(map, idx) ? 0.15 : 0;
  }, { range, passes: 2 });
  lighting.setFOV(FOV);
  lighting.setLight(x, y, color);
  return lighting;
};

class VisibilitySystem extends System {
  execute(delta: number, time: number): void {
    this.queries.visibles.results.forEach(entity => {
      const { x, y } = entity.getComponent(Position);
      const viewshed = entity.getMutableComponent(Viewshed);
      if (viewshed.dirty) {
        const visibleTiles = [];
        FOV.compute(x, y, viewshed.range, (x, y, r, visibility) => {
          visibleTiles.push(xyIdx(x, y));
          viewshed.exploredTiles.add(xyIdx(x, y));
        });
        viewshed.dirty = false;
        viewshed.visibleTiles = visibleTiles;
        if (entity.id === game.player.id) {
          // const scores = getNeighborScores(game.getState().map, viewshed.exploredTiles);
          // game.setState(state => { state.scores = scores; });
        }
      }
      if (entity.hasComponent(Light)) {
        const light = entity.getMutableComponent(Light);
        if (light.dirty) {
          const lighting = getLighting(light.range, light.color, x, y);
          const tiles = {};
          lighting.compute((x, y, color) => {
            tiles[`${xyIdx(x, y)}`] = color;
          });
          light.tiles = tiles;
          light.dirty = false;
        }
      }
    });
  }
}

VisibilitySystem.queries = {
  visibles: { components: [ Position, Viewshed ]}
};

export default VisibilitySystem;
