import * as ROT from 'rot-js';
import game, { action } from './state';
import { Zone, Zones, Trigger, Area, Position, CardinalDirection } from './types';
import { ID } from './utils/id';
import { cellKey } from './utils/map';
import { CELL_TYPES } from './cells';
import { ENTITY_TYPES } from './entities';
import { GLYPH_TYPES } from './glyphs';

const WORLD_WIDTH = 64;
const WORLD_HEIGHT = 32;

const fillRect = (cells) => (x, y, w, h, type = CELL_TYPES.FLOOR): void => {
  for (let _y = y; _y <= y + h; _y++) {
    for (let _x = x; _x <= x + w; _x++) {
      cells.push({ x: _x, y: _y, type, contents: [] });
    }
  }
};

export const setupMap = ({ playerID }) => {
  const cells = [];
  const filler = fillRect(cells);
  filler(0, 0, WORLD_WIDTH - 1, WORLD_HEIGHT - 1, CELL_TYPES.WALL);
  const map = new ROT.Map.Cellular(WORLD_WIDTH, WORLD_HEIGHT);
  map.randomize(0.5);
  for (let i = 0; i <= 3; i++) {
    map.create();
  }
  map.create((x, y, value) => {
    cells.push({ x, y, type: !value ? CELL_TYPES.WALL : CELL_TYPES.FLOOR, contents: [] });
  });
  map.connect((x, y, value) => {
    cells.push({ x, y, type: !value ? CELL_TYPES.WALL : CELL_TYPES.FLOOR, contents: [] });
  }, 1);
  for (let x = -1; x <= WORLD_WIDTH; x++) {
    cells.push({ x, y: -1, type: CELL_TYPES.WALL, contents: [] });
    cells.push({ x, y: WORLD_HEIGHT, type: CELL_TYPES.WALL, contents: [] });
  }
  for (let y = -1; y < WORLD_HEIGHT; y++) {
    cells.push({ x: -1, y, type: CELL_TYPES.WALL, contents: [] });
    cells.push({ x: WORLD_WIDTH, y, type: CELL_TYPES.WALL, contents: [] });
  }

  action('UPDATE_CELLS', { cells });
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
}

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
  }
}

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
