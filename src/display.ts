import * as ROT from 'rot-js';
import { display, game, HEIGHT, MAPWIDTH, WIDTH } from '.';
import { Light, Viewshed } from './ecs/components';
import { RenderingSystem } from './ecs/systems';
import { CellType, Map } from './map';
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

  document.querySelector('.main').appendChild(display.getContainer());

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
  };
  return map[idx] === CellType.WALL
    ? getWallGlyph(scores[idx])
    : glyphs[map[idx]];
};

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
    if (
      window.clairvoyance === true ||
      viewshed &&
      viewshed.visibleTiles &&
      viewshed.exploredTiles &&
      (viewshed.visibleTiles.includes(idx) ||
        viewshed.exploredTiles.has(idx))
    ) {
      const noise = mapNoise.get(x / 20, y / 20);
      const noiseVal = (1 + noise / 2);
      const fgWithNoise = ROT.Color.interpolate(
        [255, 255, 255],
        [
          130 + (noise > 0 ? 20 : 5) * noise,
          130 + (noise > 0 ? 20 : 5) * noise,
          130 + (noise < 0 ? 20 : 5) * noise],
        noiseVal
      );
      const glyph = getTile(idx);
      const lights = game.ecs
        .getSystem(RenderingSystem)
        .queries.lights.results
        .map(r => r.getComponent(Light))
        .filter(l => {
          return Object.keys(l.tiles)
            .reduce((acc, idx) => {
              return acc || viewshed.visibleTiles.indexOf(+idx) > -1 && map[+idx] === CellType.FLOOR;
            }, false);
        });
      const fgWithLight = addLight(lights, idx, fgWithNoise);
      const ambient: Color = [20, 20, 20];
      const fgWithAmbientLight = addStaticLight(ambient, fgWithNoise);

      const fg = viewshed.visibleTiles.includes(idx)
        ? fgWithLight as Color
        : ROT.Color.interpolate(fgWithAmbientLight, ROT.Color.fromString('#000') as Color, 0.5);

      display.draw(X, Y, glyph, ROT.Color.toHex(fg), '#000');
    }
  }
};
