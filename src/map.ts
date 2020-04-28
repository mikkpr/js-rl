import * as ROT from 'rot-js';
import game, { action } from './state';
import { Zones, Trigger } from './types';
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
    [portalID]: {
      cells: [[39, 11]],
      triggers: [{
        type: 'ENTER',
        actions: [{
          type: 'LOG_MESSAGE',
          payload: { message: 'You see something strange to the east.' }
        }]
      }, {
        type: 'EXIT',
        flags: ['PREVENT_DEFAULT_MOVE'],
        actions: [{
          type: 'MOVE_ENTITY',
          payload: { dx: 7, dy: 0, relative: true, id: playerID },
          conditions: [
            [ 'entity', [ 'type', 'eq', ENTITY_TYPES.PLAYER]],
            [ 'dx', [ 'eq', 1 ]],
            [ 'dy', [ 'eq', 0 ]]
          ]
        }]
      }],
      glyph: GLYPH_TYPES.PORTAL
    },
    [portal2ID]: {
      cells: [[46, 11]],
      triggers: [{
        type: 'ENTER',
        actions: [{
          type: 'LOG_MESSAGE',
          payload: { message: 'You see something strange to the west.' }
        }]
      }, {
        type: 'EXIT',
        flags: ['PREVENT_DEFAULT_MOVE'],
        actions: [{
          type: 'MOVE_ENTITY',
          payload: { dx: -7, dy: 0, relative: true, id: playerID },
          conditions: [
            [ 'entity', [ 'type', 'eq', ENTITY_TYPES.PLAYER]],
            [ 'dx', [ 'eq', -1 ]],
            [ 'dy', [ 'eq', 0 ]]
          ]
        }]
      }],
      glyph: GLYPH_TYPES.PORTAL
    }
  };
  action('UPDATE_ZONES', { zones });

  action('UPDATE_CELLS', { cells });
};
