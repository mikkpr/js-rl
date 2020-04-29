import * as ROT from 'rot-js';
import { CELL_PROPERTIES } from './cells';
import { Cell, Entity, GameState, Zone, Color } from './types';

import { HEIGHT, WIDTH, BOTTOM_PANEL_HEIGHT } from './index';
import { ENTITY_TYPES } from './entities';
import { GLYPHS, GLYPH_TYPES } from './glyphs';
import { getZoneCells } from './utils/zones';
import { cellKey } from './utils/map'

export const setupDisplay = (options: {width: number; height: number }): ROT.Display => {
  const display = new ROT.Display({
    width: options.width,
    height: options.height,
    fontFamily: 'Fira Mono',
    fontSize: 12,
    spacing: 1.1
  });

  const mainContainer = document.querySelector('.main');
  mainContainer.appendChild(display.getContainer());

  return display;
};

const mapNoise = new ROT.Noise.Simplex(4);

export const drawMap = ({ game, display }): void => {
  const { explorationMap, visibilityMap, lightingMap, map, camera } = game.getState();
  const ambientLight: Color = [100, 100, 100];

  Object.values(map).forEach((cell: Cell) => {
    const { x, y, type } = cell;
    const key = cellKey(x, y);
    const { glyph, fg, bg } = CELL_PROPERTIES[type].glyph;
    const fore = mapNoise.get(x/255, y/255) * 200;
    const c = ~~Math.max(50, Math.abs(fore));
    const baseColor: Color = [c, c, c];
    const light = key in lightingMap ? ROT.Color.add(ambientLight as Color, lightingMap[key]) : ambientLight;
    const finalColor = ROT.Color.multiply(baseColor, light);
    if (key in visibilityMap) {
      display.draw(x + camera.x, y + camera.y, glyph, ROT.Color.toHex(finalColor), bg);
    } else if (key in explorationMap) {
      display.draw(x + camera.x, y + camera.y, glyph, '#222', bg);
    }
  });

};

export const drawZones = ({ game, display }): void => {
  const { zones, camera, visibilityMap, explorationMap } = game.getState();

  const zonesWithGlyphs = Object.values(zones).filter(zone => {
    return (zone as Zone).glyph;
  });

  zonesWithGlyphs.forEach(zone => {
    const cells = getZoneCells(zone);
    cells.forEach(cell => {
      const [ x, y ] = cell;
      const key = cellKey(x, y);
      const { glyph, fg, bg } = GLYPHS[(zone as Zone).glyph];
      if (key in visibilityMap) {
        display.draw(x + camera.x, y + camera.y, glyph, fg, bg);
      } else if (key in explorationMap) {
        display.draw(x + camera.x, y + camera.y, glyph, '#010101', '#000');
      }
    });
  });
};

export const drawEntities = ({ game, display }): void => {
  const state = game.getState();
  const { entities, camera, visibilityMap } = (state as GameState);
  Object.values(entities).forEach(entity => {
    const { type, x , y } = entity;
    const key = cellKey(x, y);
    if (entity.type === ENTITY_TYPES.PLAYER) { return; }
    if (key in visibilityMap) {
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
