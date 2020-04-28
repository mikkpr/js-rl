import * as ROT from 'rot-js';
import game, { action } from './state';
import { Zone, Zones, Trigger } from './types';
import { ID } from './utils/id';
import { ENTITY_TYPES } from './entities';
import { GLYPH_TYPES } from './glyphs';

const defaultMap = [
  '###########################################################',
  '#...............#..................#..................#...#',
  '#...............#..................#..................#...#',
  '#.........................................................#',
  '#....######.............######.............######.........#',
  '#.........................................................#',
  '#.........................................................#',
  '#.........................................................#',
  '#...........#..................#..................#.......#',
  '#.........................................................#',
  '#.........................................................#',
  '#........###########........###########........############',
  '#.........................................................#',
  '#.........................................................#',
  '#.......#..................#..................#...........#',
  '#.........................................................#',
  '#.........................................................#',
  '#..............#....#..............#....#..............#..#',
  '#..............#....#..............#....#..............#..#',
  '#..............#....#..............#....#..............#..#',
  '###########################################################'
];

export const createPortal = ({ playerID  }) => ({
  src, dest, direction, glyph = GLYPH_TYPES.PORTAL
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

export const setupMap = ({ playerID }) => {
  const cells = [];
  for (const _y in defaultMap) {
    const y = parseInt(_y, 10);
    for (const _x in defaultMap[y].split('')) {
      const x = parseInt(_x, 10);
      const glyph = defaultMap[y][x];
      const type = glyph === '.' ? 'FLOOR' : 'WALL';
      cells.push({ x, y, type, glyph: glyph === '.' ? 'FLOOR' : 'WALL' });
    }
  }

  action('UPDATE_CELLS', { cells });
};

export const setupZones = ({ playerID }) => {
  const grassID = ID();
  const portalID = ID();
  const portal2ID = ID();
  const zones: Zones = {
    // random walk zone (top left 3x3 rect)
    [grassID]: {
      cells: [[1, 1, 15, 3]],
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
      glyph: GLYPH_TYPES.FOLIAGE,
      id: grassID
    },
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
