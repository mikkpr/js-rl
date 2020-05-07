import * as ROT from 'rot-js';

import { CellType, Map, xyIdx } from './map';
import { display, WIDTH, HEIGHT } from '.';
import tileMap from './utils/tileMap';
import { Viewshed } from './ecs/components';

export const setupDisplay = (options: { width: number; height: number }): ROT.Display => {
  const tileSet = document.createElement("img");
  tileSet.src = "dist/images/VGA8x16.png";

  const [W, H] = [8, 16];
  const display = new ROT.Display({
    layout: ROT.Display.TileGL.isSupported() ? 'tile-gl' : 'tile',
    tileWidth: W,
    tileHeight: H,
    tileSet: tileSet,
    tileMap: tileMap(),
    width: options.width,
    height: options.height,
    tileColorize: true
  });

  document.querySelector('.main').appendChild(display.getContainer());

  return display;
};

export const drawGUI = (): void => { };

const getWallGlyph = (scores, idx) => {
  switch (scores[idx]) {
  case 0:
    return '○';
  case 1:
  case 2:
  case 3:
    return '║';
  case 5:
    return '╝';
  case 6:
    return '╗';
  case 7:
    return '╣';
  case 9:
    return '╚';
  case 10:
    return '╔';
  case 11:
    return '╠';
  case 4:
  case 8:
  case 12:
    return '═';
  case 13:
    return '╩';
  case 14:
    return '╦';
  case 15:
    return '╬';
  default:
    return '#';
  }
};

// only look at cardinal directions as corner tiles don't affect the center tile
const getNeighborScores = (map, exploredTiles) => {
  const relScores = {
    '0,-1': 0b0001,
    '-1,0': 0b0100,
    '1,0': 0b1000,
    '0,1': 0b0010,
  }
  return map
    // discard tiles that are not visible
    .map((c, idx) => c === CellType.WALL && exploredTiles.has(idx) ? 1 : 0)
    .map((s, idx, scores) => {
      const [x, y] = [idx % WIDTH, ~~(idx / WIDTH)];
      const total = Object.entries(relScores).reduce((acc: number, [coordString, score]: [string, number]) => {
        const relCoords = coordString.split(',').map(s => parseInt(s, 10));
        if (
          x + relCoords[0] < 0 ||
          x + relCoords[0] >= WIDTH ||
          y + relCoords[1] < 0 ||
          y + relCoords[1] >= HEIGHT
        ) { return acc; }

        const relIdx = xyIdx(x + relCoords[0], y + relCoords[1]);
        return acc | (scores[relIdx] > 0 ? score : 0b0);
      }, 0);
      return total;
    });
};

export const drawMap = (map: Map, viewshed: Viewshed) => {
  const mapScores = getNeighborScores(map, viewshed.exploredTiles);
  for (let idx = 0; idx < map.length; idx++) {
    if (
      viewshed &&
      viewshed.visibleTiles &&
      viewshed.exploredTiles &&
      (viewshed.visibleTiles.includes(idx) ||
        viewshed.exploredTiles.has(idx))
    ) {
      const x = idx % WIDTH;
      const y = ~~(idx / WIDTH);
      const glyph = map[idx] === CellType.FLOOR ? '·' : getWallGlyph(mapScores, idx);

      const fg = ROT.Color.interpolate(
        (ROT.Color.fromString('#aaa') as [number, number, number]),
        (ROT.Color.fromString('#222') as [number, number, number]),
        viewshed.visibleTiles.includes(idx) ? 0 : 0.9
      );

      display.draw(x, y, glyph, ROT.Color.toHex(fg), '#000');
    }
  }
};
