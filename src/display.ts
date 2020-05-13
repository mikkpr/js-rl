import * as ROT from 'rot-js';import { display, game, HEIGHT, MAPWIDTH, WIDTH } from '.';
import { Name, Position, Light, Viewshed } from './ecs/components';
import { InfoSystem, RenderingSystem } from './ecs/systems';
import { xyIdx, grassNoise, CellType, Map } from './map';
import tileMap from './utils/tileMap';


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

  document.querySelector('.main-container').appendChild(display.getContainer());

  return display;
};

const getWallGlyph = (score: number): string => {
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
  const scoreLookup = {
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

  const idx = scoreLookup[score];
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
  const glyphs = {
    [CellType.FLOOR]: '∙',
    [CellType.DOOR_OPEN]: '\'',
    [CellType.DOOR_CLOSED]: '+',
    [CellType.DOOR_LOCKED]: '+',
    [CellType.GRASS]: '"',
  };
  if (map[idx] === CellType.WALL) {
    return getWallGlyph(scores[idx]);
  } else {
    return glyphs[map[idx]];
  }
};

const tileColors: { [type: string]: Color } = {
  [CellType.FLOOR]: [200, 200, 200],
  [CellType.WALL]: [255, 255, 255],
  [CellType.DOOR_OPEN]: [255, 255, 255],
  [CellType.DOOR_CLOSED]: [255, 255, 255],
  [CellType.DOOR_LOCKED]: [255, 255, 255],
  [CellType.GRASS]: [150, 255, 150],
};

export const drawHoveredInfo = () => {
  const { hoveredTileIdx, map } = game.getState();
  if (!hoveredTileIdx) { return; }

  const tileNames = {
    [CellType.FLOOR]: 'Floor',
    [CellType.WALL]: 'Wall',
    [CellType.DOOR_OPEN]: 'Door (open)',
    [CellType.DOOR_CLOSED]: 'Door (closed)',
    [CellType.DOOR_LOCKED]: 'Door (closed)',
    [CellType.GRASS]: 'Grass'
  }
  const hoveredItems = [];
  hoveredItems.push(tileNames[map[hoveredTileIdx]]);

  game.ecs.getSystem(InfoSystem).queries.info.results.forEach(e => {
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

  const viewshed = game.player.getComponent(Viewshed);
  if (viewshed.exploredTiles.has(hoveredTileIdx)) {
    for (let idx = 0; idx < hoveredItems.length; idx++) {
      display.drawText(x, y - idx, hoveredItems[idx]);
    }
  }
}

export const drawMap = (map: Map): void => {
  const player = game.player;
  const viewshed = player.getComponent(Viewshed);
  const mapScores = game.getState().scores;
  const getTile = getGlyphForCellType(map, mapScores);
  for (let idx = 0; idx < map.length; idx++) {
    const x = idx % MAPWIDTH;
    const y = ~~(idx / MAPWIDTH);
    const X = x + game.cameraOffset[0];
    const Y = y + game.cameraOffset[1];
    if (X < 0 || X >= WIDTH || Y < 0 || Y >= HEIGHT) {
      continue;
    }
    const tileVisible = viewshed && viewshed.visibleTiles && viewshed.visibleTiles.has(idx);
    const tileExplored = viewshed && viewshed.exploredTiles && viewshed.exploredTiles.has(idx);
    if (
      window.clairvoyance === true ||
      tileVisible || tileExplored
    ) {
      const tileHovered = game.getState().hoveredTileIdx === idx;
      const noise = mapNoise.get(x / 100, y / 100);
      const noiseVal = (1 + noise / 2);
      const fgColor = tileColors[map[idx]];
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

      const bgColor = grassNoise.get(x / 100, y / 100) > 0.25 ? '#010' : '#000';
      const bg = tileVisible
          ? bgColor
          : '#000';
      display.draw(X, Y, glyph, tileHovered ? bg : fg, tileHovered ? fg: bg);
    }
  }
};
