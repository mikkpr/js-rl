import * as ROT from 'rot-js';

import { CellType, Map } from './map';
import { display, WIDTH } from '.';
import tileMap from './utils/tileMap';

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

export const drawMap = (map: Map) => {
  for (let idx = 0; idx < map.length; idx++) {
    const x = idx % WIDTH;
    const y = ~~(idx / WIDTH);
    const glyph = map[idx] === CellType.FLOOR ? '.' : '#';

    display.draw(x, y, glyph, '#aaa', '#000');
  }
};
