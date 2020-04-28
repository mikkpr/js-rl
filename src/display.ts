import * as ROT from 'rot-js';
import { CELL_PROPERTIES } from './cells';
import { Cell, Entity, GameState, Zone } from './types';

import { HEIGHT, WIDTH, BOTTOM_PANEL_HEIGHT } from './index';
import { ENTITY_TYPES } from './entities';
import { GLYPHS, GLYPH_TYPES } from './glyphs';
import { getZoneCells } from './utils/zones';
import { cellKey } from './utils/map'

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
  const { explorationMap, lightingMap, map, camera } = game.getState();

  Object.values(map).forEach((cell: Cell) => {
    const { x, y, type } = cell;
    const key = cellKey(x, y);
    const { glyph, fg, bg } = CELL_PROPERTIES[type].glyph;
    if (key in lightingMap) {
      display.draw(x + camera.x, y + camera.y, glyph, fg, bg);
    } else if (key in explorationMap) {
      display.draw(x + camera.x, y + camera.y, glyph, '#222', bg);
    }
  });

};

export const drawZones = ({ game, display }): void => {
  const { zones, camera, lightingMap, explorationMap } = game.getState();

  const zonesWithGlyphs = Object.values(zones).filter(zone => {
    return (zone as Zone).glyph;
  });

  zonesWithGlyphs.forEach(zone => {
    const cells = getZoneCells(zone);
    cells.forEach(cell => {
      const [ x, y ] = cell;
      const key = cellKey(x, y);
      const { glyph, fg, bg } = GLYPHS[(zone as Zone).glyph];
      if (key in lightingMap) {
        display.draw(x + camera.x, y + camera.y, glyph, fg, bg);
      } else if (key in explorationMap) {
        display.draw(x + camera.x, y + camera.y, glyph, '#010101', '#000');
      }
    });
  });
};

export const drawEntities = ({ game, display }): void => {
  const state = game.getState();
  const { entities, camera, lightingMap } = (state as GameState);
  Object.values(entities).forEach(entity => {
    const { type, x , y } = entity;
    const key = cellKey(x, y);
    if (entity.type === ENTITY_TYPES.PLAYER) { return; }
    if (key in lightingMap) {
      const { glyph, fg, bg } = GLYPHS[entity.glyph];
      display.draw(x + camera.x, y + camera.y, glyph, fg, bg);
    }
  });
  Object.values(entities).forEach(entity => {
    const { type, x , y } = entity;
    if (entity.type !== ENTITY_TYPES.PLAYER) { return; }
    const { glyph, fg, bg } = GLYPHS[entity.glyph];
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

  drawZones({ game, display });

  drawEntities({ game, display });

  drawUI({ game, display });
};
