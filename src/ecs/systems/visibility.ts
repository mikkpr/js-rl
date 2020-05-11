import * as ROT from 'rot-js';
import { System } from 'ecsy';
import { Light, Position, Viewshed } from '../components';
import { game } from '../..';
import { CellType, xyIdx, lightPasses } from '../../map';

const DIR_NORTH = 0;
const DIR_EAST = 2;
const DIR_SOUTH = 4;
const DIR_WEST = 6;

const FOV = new ROT.FOV.RecursiveShadowcasting((x, y) => {
  const map = game.getState().map;
  const idx = xyIdx(x, y);
  return lightPasses(map, idx);
}, {
  topology: 4,
});

const getLighting = (range, color, x, y) => {
  const lighting = new ROT.Lighting((x, y) => {
    const map = game.getState().map;
    const idx = xyIdx(x, y);
    return lightPasses(map, idx) ? 0.15 : 0.0;
  }, { range, passes: 2 });
  lighting.setFOV(FOV);
  lighting.setLight(x, y, color);
  return lighting;
};

const getLimitedRange = (dir, range, origin, map) => {
  const dirs = {
    [DIR_NORTH]: [0, -1],
    [DIR_EAST]: [1, 0],
    [DIR_SOUTH]: [0, 1],
    [DIR_WEST]: [-1, 0]
  };
  for (let i = 1; i <= range; i++) {
    const X = origin[0] + dirs[dir][0] * i;
    const Y = origin[1] + dirs[dir][1] * i;
    const idx = xyIdx(X, Y);
    if ([
      CellType.GRASS,
      CellType.WALL,
      CellType.DOOR_CLOSED,
      CellType.DOOR_LOCKED
    ].includes(map[idx])) {
      return Math.max(3, i + 1);
    }
  }
  return range;
};

class VisibilitySystem extends System {
  execute(delta: number, time: number): void {
    const player = game.player;
    const playerViewshed = player.getComponent(Viewshed);
    const map = game.getState().map;
    const tileTypes = [CellType.FLOOR, CellType.DOOR_OPEN, CellType.GRASS];
    this.queries.visibles.results.forEach(entity => {
      const { x, y } = entity.getComponent(Position);
      const viewshed = entity.getMutableComponent(Viewshed);
      if (viewshed.dirty) {
        const northLimitedRange = getLimitedRange(DIR_NORTH, viewshed.range, [x, y], map);
        const eastLimitedRange = getLimitedRange(DIR_EAST, viewshed.range, [x, y], map);
        const southLimitedRange = getLimitedRange(DIR_SOUTH, viewshed.range, [x, y], map);
        const westLimitedRange = getLimitedRange(DIR_WEST, viewshed.range, [x, y], map);
        const visibleTiles = new Set<number>();
        FOV.compute90(x, y, northLimitedRange, DIR_NORTH, (x, y, r, visibility) => {
          visibleTiles.add(xyIdx(x, y));
          viewshed.exploredTiles.add(xyIdx(x, y));
        });
        FOV.compute90(x, y, eastLimitedRange, DIR_EAST, (x, y, r, visibility) => {
          visibleTiles.add(xyIdx(x, y));
          viewshed.exploredTiles.add(xyIdx(x, y));
        });
        FOV.compute90(x, y, southLimitedRange, DIR_SOUTH, (x, y, r, visibility) => {
          visibleTiles.add(xyIdx(x, y));
          viewshed.exploredTiles.add(xyIdx(x, y));
        });
        FOV.compute90(x, y, westLimitedRange, DIR_WEST, (x, y, r, visibility) => {
          visibleTiles.add(xyIdx(x, y));
          viewshed.exploredTiles.add(xyIdx(x, y));
        });

        viewshed.dirty = false;
        viewshed.visibleTiles = visibleTiles;
      }
      if (entity.hasComponent(Light)) {
        const light = entity.getMutableComponent(Light);
        if (light.dirty) {
          const visibleFloors = [...player.getComponent(Viewshed).visibleTiles]
            .filter(idx => {
              return tileTypes.includes(map[idx]);
            });

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
      const visibleFloors = [...player.getComponent(Viewshed).visibleTiles]
        .filter(idx => {
          return tileTypes.includes(map[idx]);
        });

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
