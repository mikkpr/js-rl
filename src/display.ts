import * as ROT from 'rot-js';

import { CellType, Map, xyIdx } from './map';
import { display, WIDTH, HEIGHT, MAPWIDTH, MAPHEIGHT } from '.';
import tileMap from './utils/tileMap';
import { Light, Viewshed } from './ecs/components';
import { game } from '.';

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

export const drawGUI = (): void => { };

const getWallGlyph = (score) => {
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

export const drawMap = (map: Map, viewshed: Viewshed, light: Light) => {
  const mapScores = game.getState().scores;
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
      const ambientLight: [number, number, number]= [50, 50, 50];
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
      let lightVal = ambientLight;
      if (`${idx}` in light.tiles) {
        lightVal = ROT.Color.add(lightVal, light.tiles[`${idx}`] as [number, number, number]);
      }
      const fgWithLight = ROT.Color.multiply(fgWithNoise, lightVal as [number, number, number]);
      const glyph = map[idx] === CellType.FLOOR ? '·' : getWallGlyph(mapScores[idx]);
      const LIGHT_AMT = 1;
      const fg = ROT.Color.interpolate(
        (fgWithLight as [number, number, number]),
        (ROT.Color.fromString('#000') as [number, number, number]),
        viewshed.visibleTiles.includes(idx) ? 0 : 1 - LIGHT_AMT
      );

      display.draw(X, Y, glyph, ROT.Color.toHex(fg), '#000');
    }
  }
};
