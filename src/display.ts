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
    fontFamily: 'IBMVGA8',
    fontSize: 16,
    spacing: 1.0
  });

  const mainContainer = document.querySelector('.main');
  mainContainer.appendChild(display.getContainer());

  return display;
};

const mapNoise = new ROT.Noise.Simplex(4);

export const drawMap = ({ game, display }): void => {
  const state = game.getState();
  const { items, explorationMap, visibilityMap, lightingMap, map, camera } = (state as GameState);
  const clairvoyance = eval('window.clairvoyance === true');
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
    if (key in visibilityMap || clairvoyance ) {
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

const drawLog = ({ game, display }): void => {
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

const fillRect = ({ display, x, y, w, h, glyph, fg, bg }): void => {
  for (let _x = x; _x < x + w; _x++) {
    for (let _y = y; _y < y + h; _y++) {
      display.draw(_x, _y, glyph, fg, bg);
    }
  }
};

const drawPanel = ({
  display,
  hPadding,
  vPadding,
  heading = undefined,
  contents = [],
  align = 'left',
  fill = false
}): void => {
  const corners = {
    topLeft: [hPadding, vPadding],
    topRight: [WIDTH - hPadding - 1, vPadding],
    bottomLeft: [hPadding, HEIGHT - BOTTOM_PANEL_HEIGHT - vPadding],
    bottomRight: [WIDTH - hPadding-  1, HEIGHT - BOTTOM_PANEL_HEIGHT - vPadding]
  };
  const edges = {
    top: [
      [corners.topLeft[0] + 1, corners.topLeft[1]],
      [corners.topRight[0], corners.topRight[1]]
    ],
    right: [
      [corners.topRight[0], corners.topRight[1] + 1],
      [corners.bottomRight[0], corners.bottomRight[1]]
    ],
    bottom: [
      [corners.bottomLeft[0] + 1, corners.bottomLeft[1]],
      [corners.bottomRight[0], corners.bottomRight[1]]
    ],
    left: [
      [corners.topLeft[0], corners.topLeft[1] + 1],
      [corners.bottomLeft[0], corners.bottomLeft[1]]
    ]
  };

  display.draw(corners.topLeft[0], corners.topLeft[1], ...Object.values(GLYPHS.UI_CORNER_TOP_LEFT));
  display.draw(corners.topRight[0], corners.topRight[1], ...Object.values(GLYPHS.UI_CORNER_TOP_RIGHT));
  display.draw(corners.bottomLeft[0], corners.bottomLeft[1], ...Object.values(GLYPHS.UI_CORNER_BOTTOM_LEFT));
  display.draw(corners.bottomRight[0], corners.bottomRight[1], ...Object.values(GLYPHS.UI_CORNER_BOTTOM_RIGHT));

  for (let x = edges.top[0][0], y = edges.top[0][1]; x < edges.top[1][0]; x++) {
    display.draw(x, y, ...Object.values(GLYPHS.UI_LINE_HORIZONTAL));
  }

  for (let x = edges.bottom[0][0], y = edges.bottom[0][1]; x < edges.bottom[1][0]; x++) {
    display.draw(x, y, ...Object.values(GLYPHS.UI_LINE_HORIZONTAL));
  }

  for (let x = edges.left[0][0], y = edges.left[0][1]; y < edges.left[1][1]; y++) {
    display.draw(x, y, ...Object.values(GLYPHS.UI_LINE_VERTICAL));
  }

  for (let x = edges.right[0][0], y = edges.right[0][1]; y < edges.right[1][1]; y++) {
    display.draw(x, y, ...Object.values(GLYPHS.UI_LINE_VERTICAL));
  }

  if (fill) {
    const { glyph, fg, bg } = GLYPHS.UI_BACKGROUND; 
    fillRect({
      display,
      x: hPadding + 1,
      y: vPadding + 1,
      w: WIDTH - 2 * (hPadding + 1),
      h: HEIGHT - BOTTOM_PANEL_HEIGHT - 2 * (vPadding + 1) + 1,
      glyph,
      fg,
      bg
    });
  }

  if (heading) {
    const maxLength = WIDTH - 2 * (hPadding + 1);
    const headingLeftPadding = (maxLength - heading.length) / 2;
    display.drawText(hPadding + 1 + headingLeftPadding, vPadding + 1, heading);
  }

  if (contents.length > 0) {
    const [contentX, contentY] = [
      hPadding + 2,
      vPadding + 3
    ];
    for (let i = 0; i < contents.length; i++) {
      display.drawText(contentX, contentY + i, contents[i]);
    }
  }
};

const drawInventoryPanel = ({ game, display }): void => {
  const state = game.getState();
  const { items, entities } = (state as GameState);
  const player = Object.values(entities)
    .filter(e => e.type === ENTITY_TYPES.PLAYER)[0];
  const contents = player.inventory.map(id => items[id].name);
  drawPanel({
    display,
    hPadding: 20,
    vPadding: 3,
    fill: true,
    heading: 'Inventory',
    contents,
    align: 'left'
  });
};

const drawInventoryDropPanel = ({ game, display }): void => {
  const state = game.getState();
  const { items, entities } = (state as GameState);
  const player = Object.values(entities)
    .filter(e => e.type === ENTITY_TYPES.PLAYER)[0];
  const chars = 'asdfghjkl'.split('');
  const contents = player.inventory.map((id, idx) => `${chars[idx]}) ${items[id].name}`);
  drawPanel({
    display,
    hPadding: 20,
    vPadding: 3,
    fill: true,
    heading: 'Drop item',
    contents,
    align: 'left'
  });
};

const drawUIPanels = ({ game, display }) => {
  const { activePanels } = game.getState();
  if (activePanels.length === 0) { return; }

  const topPanel = activePanels[activePanels.length - 1];

  if (topPanel === 'inventory') {
    drawInventoryPanel({ game, display });
  } else if (topPanel === 'inventory:drop') {
    drawInventoryDropPanel({ game, display });
  }
}

export const drawUI = ({ game, display }): void => {
  drawUIPanels({ game, display });
  drawLog({ game, display});
};

export const draw = ({ game, display }): void => {
  display.clear();

  drawMap({ game, display });

  drawZones({ game, display });

  drawEntities({ game, display });

  drawUI({ game, display });
};
