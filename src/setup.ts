import { Display } from 'rot-js';

import tileMap from './utils/tileMap';

export const setupDisplay = (options: { width: number; height: number }): Display | null => {
  const container = document.querySelector('.main-container');
  if (!container) { return null; }
  const tileSet = document.createElement("img");
  tileSet.src = "dist/images/VGA8x16.png";

  const [W, H] = [8, 16];
  const display = new Display({
    layout: Display.TileGL.isSupported() ? 'tile-gl' : 'tile',
    tileWidth: W,
    tileHeight: H,
    tileSet: tileSet,
    tileMap: tileMap(),
    width: options.width,
    height: options.height,
    tileColorize: true
  });

  const canvas = display.getContainer();
  if (canvas) {
    container.appendChild(canvas);
    canvas.setAttribute('oncontextmenu', 'return false;');
  } 

  return display;
};
