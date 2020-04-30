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
    fontSize: 14
  });

  const mainContainer = document.querySelector('.main');
  mainContainer.appendChild(display.getContainer());

  return display;
};

const mapNoise = new ROT.Noise.Simplex(4);

export const drawMap = ({ game, display }): void => {
  const state = game.getState();
  const { items, explorationMap, visibilityMap, lightingMap, map, camera } = (state as GameState);
  const omniscience = eval('window.omniscience === true');
  const ambientLight: Color = [80, 80, 80];

  Object.values(map).forEach((cell: Cell) => {
    const { x, y, type, contents } = cell;
    const key = cellKey(x, y);
    const useItemGlyph = contents.length > 0;
    const item = items[contents[0]];
    const itemGlyph = item ? GLYPHS[item.glyph] : undefined;
    const cellGlyph = GLYPHS[CELL_PROPERTIES[type].glyph];
    const { glyph, fg, bg } = useItemGlyph
      ? itemGlyph
      : cellGlyph;
    const [R, G, B] = ROT.Color.fromString(fg);
    const noiseVal = mapNoise.get(x/20, y/20) * 240;
    const c = ~~Math.max(1, noiseVal);
    const baseColor: Color = useItemGlyph
      ? [R, G, B]
      : [
        255-c / 255 * R,
        255-c / 255 * G,
        255-c / 255 * B
      ];
    const light = key in lightingMap ? ROT.Color.add(ambientLight as Color, lightingMap[key]) : ambientLight;
    const finalColor = ROT.Color.multiply(baseColor, light);
    if (key in visibilityMap || omniscience) {
      display.draw(x + camera.x, y + camera.y, glyph, ROT.Color.toHex(finalColor), bg);
    } else if (key in explorationMap) {
      display.draw(x + camera.x, y + camera.y, cellGlyph.glyph, '#222', bg);
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
