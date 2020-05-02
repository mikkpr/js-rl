import { action } from './state';
import { Zone, Zones, Area, Position, CardinalDirection } from './types';
import { ID } from './utils/id';
import { ENTITY_TYPES } from './entities';
import { GLYPH_TYPES } from './glyphs';
import WFC from '../lib/ndwfc/ndwfc';
import { WFCTool2D } from '../lib/ndwfc/ndwfc-tools';

const makeTiles = (tile: string | string[][], size): Array<string[][]> => {
  const EMPTY = [];
  let tileArr = tile;
  if (typeof tile === 'string') {
    tileArr = tile.trim().split('\n').map(r => r.trim().split(''));
  }
  if (tileArr.length !== tileArr[0].length) {
    console.error('input tile is not square!', tile);
    return EMPTY;
  }
  const N = tileArr.length;
  if (size > tileArr.length) {
    console.error('input size is larger than input tile size!');
    return EMPTY;
  }

  const out = EMPTY;

  for (let x = 0; x <= N - size; x++) {
    for (let y = 0; y <= N - size; y++) {
      const square = [];
      let i = 0;
      for (let q = y; q < y + size; q++) {
        for (let p = x; p < x + size; p++) {
          square.push(tileArr[q][p]);
          // if (i++ % size !== 0) {
          //   square.push('\n');
          // }
        }
        square.push('\n')
      }
      out.push(square.slice(0, square.length - 1).join(''));
    }
  }
  console.log(out);
  return out;
}

export const generateMap = (WORLD_WIDTH, WORLD_HEIGHT) => {
  const cells = [];

  const tool = new WFCTool2D();

  const input = `\
  ###.#
  .....
  #.###
  #.###
  #...#
  `;

  makeTiles(input, 3).forEach(t => tool.addTile(t));


  // DEBUG
  eval('window.clairvoyance = true');

  tool.addColor('#', [255,255,255]);
  tool.addColor('.', [100, 100, 100]);

  const tiles = tool.getTileFormulae();

  const WFCInput: {
    nd: any;
    weights: any;
    rules: any;
    wave: any;
  } = tool.generateWFCInput();
  const wfc = new WFC(WFCInput);

  let size = 3;
  wfc.expand(
    [-size, -size],
    [size, size]
  );

  let i = 0;
  while (i++ < 5000) {
    const done = wfc.step();
    if (done) {
      if (size >= 5) { break; }

      size += 1;
      wfc.expand(
        [-size, -size],
        [size, size]
      );
    }
  }

  const readout = wfc.readout();

  let maxX = 0;
  let maxY = 0;
  Object.keys(readout).forEach(k => {
    const [y, x] = k.split(',').map(n => parseInt(n, 10));
    if (x >= maxX) { maxX = x; }
    if (y >= maxY) { maxY = y; }

    const tile = tiles[readout[k]];
    const rows = tile[2];

    const worldX = x*rows[0].length;
    const worldY = y*rows.length;

    rows.forEach((vrow, yOffset) => {
      vrow.forEach((tile, xOffset) => {
        cells.push({
          x: worldX + xOffset,
          y: worldY + yOffset,
          type: tile === '#' ? 'WALL' : 'FLOOR',
          contents: [],
          flags: []
        });
      })
    });
  });

  return cells;
};

export const createRandomWalkZone = ({
  x, y, width, height
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}): Zone => {
  const area = [x, y, width, height];
  return {
    cells: [(area as Area)],
    triggers: [{
      type: 'WITHIN',
      flags: ['PREVENT_DEFAULT_MOVE'],
      actions: [{
        type: 'RANDOM_WALK',
        payload: { },
        conditions: [
          [ 'entity', [ 'type', 'eq', ENTITY_TYPES.PLAYER]]
        ]
      }, {
        type: 'LOG_MESSAGE',
        payload: { message: 'The tall grass confuses you.' },
        conditions: [
          [ 'entity', [ 'type', 'eq', ENTITY_TYPES.PLAYER]]
        ]
      }]
    }],
    glyph: GLYPH_TYPES.FOLIAGE
  };
};

export const createExit = ({ playerID }) => ({ src }): Zone => {
  return {
    cells: [[src.x, src.y]],
    triggers: [{
      type: 'ENTER',
      actions: [{
        type: 'LOG_MESSAGE',
        payload: { message: 'You successfully reached the exit.' },
        conditions: [
          [ 'entity', [ 'type', 'eq', ENTITY_TYPES.PLAYER]]
        ]
      }, {
        type: 'EXIT',
        payload: {},
        conditions: [
          [ 'entity', [ 'type', 'eq', ENTITY_TYPES.PLAYER]]
        ]
      }]
    }]
  };
};

export const createPortal = ({ playerID  }) => ({
  src, dest, direction, glyph = GLYPH_TYPES.PORTAL
}: {
  src: Position;
  dest: Position;
  direction: CardinalDirection;
  glyph?: string;
}): Zone => {
  const dx = dest.x - src.x;
  const dy = dest.y - dest.y;
  let [dirX, dirY] = [0, 0];
  if (direction === 'east') {
    dirX = 1;
  } else if (direction === 'west') {
    dirX = -1;
  } else if (direction === 'north') {
    dirY = -1;
  } else if (direction === 'south') {
    dirY = 1;
  }

  return {
    cells: [[src.x, src.y]],
    triggers: [{
      type: 'ENTER',
      actions: [{
        type: 'LOG_MESSAGE',
        payload: { message: `You see something strange to the ${direction}.` }
      }]
    }, {
      type: 'EXIT',
      flags: ['PREVENT_DEFAULT_MOVE'],
      actions: [{
        type: 'MOVE_ENTITY',
        payload: { dx, dy, id: playerID },
        conditions: [
          [ 'entity', [ 'type', 'eq', ENTITY_TYPES.PLAYER]],
          [ 'dx', [ 'eq', dirX ]],
          [ 'dy', [ 'eq', dirY ]]
        ]
      }]
    }, {
      type: 'EXIT',
      flags: ['PREVENT_DEFAULT_MOVE'],
      actions: [{
        type: 'LOG_MESSAGE',
        payload: { 'message': 'You step through the portal.' },
        conditions: [
          [ 'entity', [ 'type', 'eq', ENTITY_TYPES.PLAYER]],
          [ 'dx', [ 'eq', dirX ]],
          [ 'dy', [ 'eq', dirY ]]
        ]
      }]
    }],
    glyph
  };
};

export const setupZones = ({ playerID }) => {
  const grassID = ID();
  const portalID = ID();
  const portal2ID = ID();
  const zones: Zones = {
    [grassID]: createRandomWalkZone({
      x: 1, y: 1, width: 15, height: 3
    }),
    [portalID]: createPortal({ playerID })({
      src: { x: 39, y: 11 },
      dest: { x: 46, y: 11 },
      direction: 'west'
    }),
    [portal2ID]: createPortal({ playerID })({
      src: { x: 46, y: 11 },
      dest: { x: 39, y: 11 },
      direction: 'east'
    })
  };
  action('UPDATE_ZONES', { zones });
};
