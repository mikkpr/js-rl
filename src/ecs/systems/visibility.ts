import * as ROT from 'rot-js';
import { System } from 'ecsy';
import { Light, Position, Viewshed } from '../components';
import { game } from '../..';
import { CellType, xyIdx, lightPasses } from '../../map';

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
  }, { range, passes: 1 });
  lighting.setFOV(FOV);
  lighting.setLight(x, y, color);
  return lighting;
};

class VisibilitySystem extends System {
  execute(delta: number, time: number): void {
    const player = game.player;
    const playerViewshed = player.getComponent(Viewshed);
    const map = game.getState().map;
    const tileTypes = [CellType.FLOOR, CellType.DOOR_OPEN, CellType.GRASS];
    const visibleFloors = [...playerViewshed.visibleTiles]
      .filter(idx => {
        return tileTypes.includes(map[idx])
      });
    this.queries.visibles.results.forEach(entity => {
      const { x, y } = entity.getComponent(Position);
      const viewshed = entity.getMutableComponent(Viewshed);
      if (viewshed.dirty) {
        const visibleTiles = new Set<number>();
        FOV.compute(x, y, viewshed.range, (x, y, r, visibility) => {
          visibleTiles.add(xyIdx(x, y));
          viewshed.exploredTiles.add(xyIdx(x, y));
        });
        viewshed.dirty = false;
        viewshed.visibleTiles = visibleTiles;
      }
      if (entity.hasComponent(Light)) {
        const light = entity.getMutableComponent(Light);
        if (light.dirty) {
          const lighting = getLighting(light.range, light.color, x, y);
          const tiles = {};
          light.applicable = false;
          lighting.compute((x, y, color) => {
            const tileIdx = xyIdx(x, y);
            if (visibleFloors.includes(tileIdx)) {
              light.applicable = true;
            }
            tiles[`${tileIdx}`] = color;
          });
          light.tiles = tiles;
          light.dirty = false;
        }
      }
    });
    this.queries.lights.results.forEach(entity => {
      const light = entity.getMutableComponent(Light);
      light.applicable = false;
      for (const tile of Object.keys(light.tiles)) {
        if (visibleFloors.includes(+tile)) {
          light.applicable = true;
          break;
        }
      }
    });
  }
}

VisibilitySystem.queries = {
  visibles: { components: [ Position, Viewshed ]},
  lights: { components: [ Light ] }
};

export default VisibilitySystem;
