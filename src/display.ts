import * as ROT from 'rot-js';

import { CellType, Map } from './map';
import { display, WIDTH } from '.';
import tileMap from './utils/tileMap';
import { Viewshed } from './ecs/components';

export const setupDisplay = (options: {width: number; height: number }): ROT.Display => {
  const tileSet = document.createElement("img");
  tileSet.src = "dist/images/VGA8x16.png";

  const [ W, H ] = [8, 16];
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

export const drawGUI = (): void => {};

export const drawMap = (map: Map, viewshed: Viewshed) => {
  for (let idx = 0; idx < map.length; idx++) {
    if (viewshed.visibleTiles.includes(idx) ||
       viewshed.exploredTiles.has(idx)) {
      const x = idx % WIDTH;
      const y = ~~(idx / WIDTH);
      const glyph = map[idx] === CellType.FLOOR ? '.' : '#';

      const fg = ROT.Color.interpolate(
        (ROT.Color.fromString('#aaa') as [number, number, number]),
        (ROT.Color.fromString('#222') as [number, number, number]),
        viewshed.visibleTiles.includes(idx) ? 0 : 0.9
      );

      display.draw(x, y, glyph, ROT.Color.toHex(fg), '#000');
    }
  }
};
