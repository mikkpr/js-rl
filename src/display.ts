import * as ROT from 'rot-js';
import { CELL_PROPERTIES } from './map';
import { Map, Cell, Entity } from './types';

import { HEIGHT, WIDTH, BOTTOM_PANEL_HEIGHT } from './index';

export const setupDisplay = (options: {width: number; height: number }): ROT.Display => {
  const display = new ROT.Display({
    width: options.width,
    height: options.height,
    fontFamily: 'Fira Mono'
  });

  document.querySelector('.main').appendChild(display.getContainer());

  return display;
};

export const drawMap = ({ game, display }): void => {
  const { map, camera } = game.getState();

  Object.values(map).forEach((cell: Cell) => {
    const { x, y, type } = cell;
    const { glyph, fg, bg } = CELL_PROPERTIES[type];
    display.draw(x + camera.x, y + camera.y, glyph, fg, bg);
  });

};

export const drawEntities = ({ game, display }): void => {
  const { entities, camera } = game.getState();
  Object.values(entities).forEach(entity => {
    const { x, y, glyph, fg, bg } = (entity as Entity);
    display.draw(x + camera.x, y + camera.y, glyph, fg, bg);   
  });

};

export const drawUI = ({ game, display }): void => {

  const { log } = game.getState();
  for (let x = 0; x < WIDTH; x++) {
    display.draw(x, HEIGHT - BOTTOM_PANEL_HEIGHT, '—', '#222', '#000a');
    for (let y = HEIGHT - BOTTOM_PANEL_HEIGHT + 1; y < HEIGHT; y++) {
      display.draw(x, y, ' ', '#fff', '#000');
    }
  }
  for (let y = BOTTOM_PANEL_HEIGHT - 1; y >= 0; y--) {
    const { text, count, fg, bg } = log[log.length - y - 1] || {};
    if (!text) { continue; }
    const countStr = count > 1 ? ` (${count}x)` : '';
    display.drawText(1, HEIGHT - BOTTOM_PANEL_HEIGHT + y + 1, `${text}${countStr}`);
  }
};

export const draw = ({ game, display }): void => {
  display.clear();

  drawMap({ game, display });

  drawEntities({ game, display });

  drawUI({ game, display });
};
