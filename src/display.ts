import * as ROT from 'rot-js';
import { match } from 'egna';
import { ECS, display, game, LOGHEIGHT, SIDEBARWIDTH, HEIGHT, MAPWIDTH, WIDTH } from '.';
import GameState from './state';
import { Renderable, Name, Position, Light, Viewshed } from './ecs/components';
import { InfoSystem, RenderingSystem } from './ecs/systems';
import { xyIdx, grassNoise, CellType, Map } from './map';
import tileMap from './utils/tileMap';
import { normalizeScore } from './utils/map';

export const setupMinimap = (options: { width: number; height: number; }): HTMLCanvasElement | null => {
  const container = document.querySelector('.minimap');
  if (!container) { return null; }

  const canvas: HTMLCanvasElement = document.createElement('canvas');
  container.appendChild(canvas);
  canvas.setAttribute('width', (options.width * 2).toString());
  canvas.setAttribute('height', (options.height * 2).toString());

  return canvas;
}

export const setupDisplay = (options: { width: number; height: number }): ROT.Display | null => {
  const container = document.querySelector('.main-container');
  if (!container) { return null; }
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

  const canvas = display.getContainer();
  if (canvas) {
    container.appendChild(canvas);
    canvas.setAttribute('oncontextmenu', 'return false;');
  } 

  return display;
};


const getWallGlyph = (score: number): string => {
  let normalizedScore = normalizeScore(score);  

  const pillar = '○';
  const wallN = '▀';
  const wallW = '▌';
  const wallE = '▐';
  const wallS = '▄';
  const tiles = [
    ' ', wallN, wallW, '╝', '╝', wallE, '╚', '╚',
    '═', '╩', '╩', '╩', '═', wallS, '║', '╗',
    '╣', '╣', '╔', '╠', '╠', '╦', '╬', '╬',
    '╬', '╦', '╗', '╣', '║', '╦', '╬', '╠',
    '╬', '╔', '╔', '╠', '║', '╦', '╬', '╬',
    '╣', '╗', '═', '╩', '╚', '╝', ' ', pillar
  ];
  const scoreLookup: {
    [score: number]: number
  } = {
    0: 47,
    2: 1,
    8: 2,
    10: 3,
    11: 4,
    16: 5,
    18: 6,
    22: 7,
    24: 8,
    26: 9,
    27: 10,
    30: 11,
    31: 12,
    64: 13,
    66: 14,
    72: 15,
    74: 16,
    75: 17,
    80: 18,
    82: 19,
    86: 20,
    88: 21,
    90: 22,
    91: 23,
    94: 24,
    95: 25,
    104: 26,
    106: 27,
    107: 28,
    120: 29,
    122: 30,
    123: 31,
    126: 32,
    127: 33,
    208: 34,
    210: 35,
    214: 36,
    216: 37,
    218: 38,
    219: 39,
    222: 40,
    223: 41,
    248: 42,
    250: 43,
    251: 44,
    254: 45,
    255: 46
  };

  const idx = scoreLookup[normalizedScore];
  if (!idx) { return ' '; }
  return tiles[idx];
};

const mapNoise = new ROT.Noise.Simplex(4);

export const addLight = (
  lights: Light[],
  idx: number,
  fg: Color,
  ambientLight = [80, 80, 80]
): Color => {
  let lightVal: Color = ambientLight.slice() as Color;
  for (const light of lights) {
    if (light.tiles && `${idx}` in light.tiles) {
      lightVal = ROT.Color.add(lightVal, light.tiles[`${idx}`] as Color);
    }
  }
  const fgWithLights = ROT.Color.multiply(fg, lightVal as Color);

  return fgWithLights;
};

const addStaticLight = (light: Color, fg: Color): Color => {
  const fgWithLights = ROT.Color.multiply(fg, light as Color);
  return fgWithLights;
};

const getGlyphForCellType = (map: Map, scores: number[]) => (idx: number): string => {
  const glyphs: {
    [id: string]: string[]
  } = {
    [CellType.FLOOR]: ['∙'],
    [CellType.DOOR_OPEN]: ['\''],
    [CellType.DOOR_CLOSED]: ['+'],
    [CellType.DOOR_LOCKED]: ['+'],
    [CellType.GRASS]: ['`', '"'],
  }
  const glyph = match(
    CellType.WALL, () => getWallGlyph(scores[idx]),
    CellType.GRASSY_WALL, () => getWallGlyph(scores[idx]),
    () => {
      
      const glyphChoices = glyphs[map[idx]];
      const x = idx % MAPWIDTH;
      const y = ~~(idx / MAPWIDTH);
      const noiseAbs = Math.abs(mapNoise.get(x / 2, y / 2));
      const _idx = Math.min(glyphChoices.length - 1, Math.max(0, Math.round(noiseAbs * glyphChoices.length)));
      return glyphChoices[_idx]
    },
  )(map[idx]);  
  return glyph;
};

const tileColors: { [type: string]: Color } = {
  [CellType.FLOOR]: [120, 120, 120],
  [CellType.WALL]: [200, 200, 200],
  [CellType.DOOR_OPEN]: [120, 80, 60],
  [CellType.DOOR_CLOSED]: [120, 80, 60],
  [CellType.DOOR_LOCKED]: [120, 80, 60],
  [CellType.GRASS]: [150, 255, 150],
  [CellType.GRASSY_WALL]: [120, 150, 100],
};

export const drawHoveredInfo = (game: GameState) => {
  const { hoveredTileIdx, map } = game.getState();
  if (!hoveredTileIdx) { return; }

  const tileNames = {
    [CellType.FLOOR]: 'Floor',
    [CellType.WALL]: 'Wall',
    [CellType.DOOR_OPEN]: 'Door (open)',
    [CellType.DOOR_CLOSED]: 'Door (closed)',
    [CellType.DOOR_LOCKED]: 'Door (closed)',
    [CellType.GRASS]: 'Grass',
    [CellType.GRASSY_WALL]: 'Grassy wall',
  }
  const hoveredItems = [];
  hoveredItems.push(tileNames[map[hoveredTileIdx as number] as CellType]);

  ECS.getSystem(InfoSystem).queries.info.results.forEach(e => {
    const pos = e.getComponent(Position);
    const idx = xyIdx(pos.x, pos.y);
    if (idx === hoveredTileIdx) {
      const name = e.getComponent(Name);
      if (!name || !name.name) { return; }
      hoveredItems.push(name.name);
    }
  });

  const y = HEIGHT - 1;
  const x = WIDTH - 1 - hoveredItems.filter(x => x).reduce((len, item) => Math.max(len, item.length), 0);

  if (!game || !game.player || !game.display) { return; }
  const viewshed = game.player.getComponent(Viewshed);
  if (viewshed && viewshed.exploredTiles.has(hoveredTileIdx)) {
    for (let idx = 0; idx < hoveredItems.length; idx++) {
      game.display.drawText(x, y - idx, hoveredItems[idx]);
    }
  }

  if (window.DEBUG) {
    const x = hoveredTileIdx % MAPWIDTH;
    const y = ~~(hoveredTileIdx / MAPWIDTH);
    game.display.drawText(1, 1, `x: ${x}, y: ${y}, idx: ${hoveredTileIdx}`);
  }
}

export const drawMap = (game: GameState, map: Map): void => {
  const { player, cameraOffset, display } = game;
  if (!player || !cameraOffset || !display) { return; }
  const viewshed = player.getComponent(Viewshed);
  const { mapScores } = game.getState(state => ({ mapScores: state.scores, altPressed: state.altPressed }));
  const getTile = getGlyphForCellType(map, mapScores);
  for (let idx = 0; idx < map.length; idx++) {
    const x = idx % MAPWIDTH;
    const y = ~~(idx / MAPWIDTH);
    const X = x + cameraOffset[0];
    const Y = y + cameraOffset[1];
    if (X < 0 || X >= WIDTH || Y < 0 || Y >= HEIGHT) {
      continue;
    }
    const tileVisible = viewshed && viewshed.visibleTiles && viewshed.visibleTiles.has(idx);
    const tileExplored = viewshed && viewshed.exploredTiles && viewshed.exploredTiles.has(idx);
    if (
      window.DEBUG === true ||
      tileVisible || tileExplored
    ) {
      const tileHovered = game.getState().hoveredTileIdx === idx;
      const noise = mapNoise.get(x / 100, y / 100);
      const noiseVal = (1 + noise / 2);
      let fgColor = tileColors[map[idx]];
      if (map[idx] === CellType.GRASS) {
        const grassColorVariance = grassNoise.get(x / 5, y / 7) * 50;
        fgColor = ROT.Color.multiply(fgColor, [grassColorVariance + 40, grassColorVariance + 80, grassColorVariance + 40]);
      }
      if (!fgColor) { console.log(idx, map[idx]) }
      const fgColorWithNoise = ROT.Color.multiply(fgColor, [80, 80, 80]);
      const fgWithNoise = ROT.Color.interpolate(
        fgColor,
        [
          fgColorWithNoise[0] + (noise > 0 ? 20 : 5) * noise,
          fgColorWithNoise[1] + (noise > 0 ? 20 : 5) * noise,
          fgColorWithNoise[2] + (noise < 0 ? 20 : 5) * noise],
        noiseVal
      );
      const glyph = getTile(idx);
      const lights = game.ecs
        .getSystem(RenderingSystem)
        .queries.lights.results
        .map(r => r.getComponent(Light))
        .filter(l => l.applicable);
      const fgWithLight = addLight(lights, idx, fgWithNoise);
      const ambient: Color = [80, 80, 80];
      const fgWithAmbientLight = addStaticLight(ambient, fgWithNoise);

      const fgRGB = tileVisible
        ? fgWithLight as Color
        : ROT.Color.interpolate(fgWithAmbientLight, ROT.Color.fromString('#000') as Color, 0.5);

      const fg = ROT.Color.toHex(fgRGB);

      const bgColor = map[idx] === CellType.GRASSY_WALL ? '#010' : '#000';
      const bg = tileVisible
          ? bgColor
          : '#000';
      display.draw(X, Y, glyph, tileHovered ? bg : fg, tileHovered ? fg: bg);
    }
  }
};

export const drawGUI = (game: GameState) => {
  if (!game || !game.display) { return; }
  const FG = '#777';
  const BG = '#000';
  // top line
  game.display.draw(0, 0, '┌', FG, BG);
  game.display.drawText(1, 0, (new Array(WIDTH - 1)).fill('─').join(''))   
  game.display.draw(WIDTH, 0, '╥', FG, BG);
  game.display.drawText(WIDTH + 1, 0, (new Array(SIDEBARWIDTH - 1)).fill('─').join(''))   
  game.display.draw(WIDTH + SIDEBARWIDTH - 1, 0, '┐', FG, BG);

  // bottom line
  game.display.draw(0, HEIGHT + LOGHEIGHT - 1, '└', FG, BG);
  game.display.drawText(1, HEIGHT + LOGHEIGHT - 1, (new Array(WIDTH - 1)).fill('─').join(''))   
  game.display.draw(WIDTH, HEIGHT + LOGHEIGHT - 1, '╨', FG, BG);
  game.display.drawText(WIDTH + 1, HEIGHT + LOGHEIGHT - 1, (new Array(SIDEBARWIDTH - 1)).fill('─').join(''))   
  game.display.draw(WIDTH + SIDEBARWIDTH - 1, HEIGHT + LOGHEIGHT - 1, '┘', FG, BG);

  for (let y = 1; y < HEIGHT + LOGHEIGHT - 1; y++) {
    game.display.draw(0, y, '│', FG, BG)
    game.display.draw(WIDTH + SIDEBARWIDTH - 1, y, '│', FG, BG)
    game.display.draw(WIDTH, y, '║', FG, BG)
    if (y === HEIGHT) {
      game.display.draw(0, y, '╞', FG, BG);
      game.display.draw(WIDTH, y, '╣', FG, BG);
      game.display.drawText(1, y, '%c{#777}' + (new Array(WIDTH - 1)).fill('═').join(''))   
    }
  }

  drawLog(game, game.getState().log);

  drawSidebar();
}

const drawLog = (game: GameState, log: string) => {
  if (!game.display) { return; }
  const N = 8;
  const colorOffset = Math.max(8 - log.length, 0);
  const lastLines = (log.length <= N ? [...log] : [...log].slice(log.length - N)).reverse();
  for (let i = 0; i < lastLines.length; i++) {
    const line = lastLines[lastLines.length - i - 1];
    const chars = '89abcdef'.split('');
    const lineColor = `#${ (new Array(3)).fill(chars[i + colorOffset]).join('') }`;
    game.display.drawText(2, HEIGHT + 1 + i, `%c{${lineColor}}${line}`);
  }
}

const drawSidebar = () => {
  
}

export const drawAltInfo = (game: GameState) => {
  const renderables = ECS.systemManager.getSystem(RenderingSystem).queries.renderables;
  const player = game.player;
  const playerX = player.getComponent(Position).x;
  const playerY = player.getComponent(Position).y;
  const cameraOffset = game.cameraOffset;
  const { visibleTiles } = player.getComponent(Viewshed);
  const renderablesInView = renderables.results.filter(r => {
    if (r.name === 'player') { return false; }
    const { x, y } = r.getComponent(Position);
    const idx = xyIdx(x, y);
    return visibleTiles.has(idx);
  });
  const labels = [];
  for (const entity of renderablesInView) {
    const { x, y } = entity.getComponent(Position);
    const { name } = entity.getComponent(Name);
    const { fg } = entity.getComponent(Renderable);
    
    labels.push({
      x,
      y,
      name,
      fg,
      bg: '#333'
    });
  }
  const positionedLabels = labels.reduce((acc, label, idx, labels) => {
    const { x, y, name } = label;
    const offset = 1;
    let _x = x;
    let _y = y;
    let positionLeft;
    if (x <= playerX && x + name.length + 1 + offset >= WIDTH - cameraOffset[0]) {
      positionLeft = true;
    } else if (x >= playerX && x - name.length - offset <= 0 - cameraOffset[1]) {
      positionLeft = false; 
    } else if (x + name.length + 1 + offset >= playerX && x + offset <= playerX) {
      positionLeft = true;
    }

    if (positionLeft) {
      _x = x - name.length - offset;
    } else {
      _x = x + 1 + offset;
    }

    if (idx > 0) {  
      // adjust x and y to not overlap any existing labels
      for (const other of labels.slice(idx)) {
        if (_y === other.y && !positionLeft && _x + name.length + 1 + offset >= other.x + offset + 1) {
          _y += 1;
        }
      }
    }
     
    return acc.concat([{
        ...label,
        x: _x,
        y: _y
      }]);
  }, []);

  for (const label of positionedLabels) {
    game.display.drawText(
      label.x + cameraOffset[0],
      label.y + cameraOffset[1],
      `%c{${label.fg}}%b{${label.bg}}${label.name}%c{}%b{}`
    );
  }
}
