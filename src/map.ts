import { action } from './state';
import { Zones, Trigger } from './types';
import { ID } from './utils/id';
import { ENTITY_TYPES } from './entities';
export const CELL_TYPES = {
  FLOOR: 'FLOOR',
  WALL: 'WALL'
};

export const GLYPHS = {
  [CELL_TYPES.FLOOR]: '.',
  [CELL_TYPES.WALL]: '#'
};

export const CELL_PROPERTIES = {
  [CELL_TYPES.FLOOR]: {
    glyph: GLYPHS.FLOOR,
    fg: '#444',
    bg: '#000',
    solid: false
  },
  [CELL_TYPES.WALL]: {
    glyph: GLYPHS.WALL,
    fg: '#aaa',
    bg: '#000',
    solid: true
  }
};

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

export const setupMap = () => {
  const cells = [];
  for (const _y in defaultMap) {
    const y = parseInt(_y, 10);
    for (const _x in defaultMap[y].split('')) {
      const x = parseInt(_x, 10);
      const glyph = defaultMap[y][x];
      const type = glyph === '.' ? 'FLOOR' : 'WALL';
      cells.push({ x, y, type });
    }
  }

  const zoneID = ID();
  const zones: Zones = {
    [zoneID]: {
      cells: [[1, 1, 3, 0]],
      triggers: [{
        type: 'ENTER',
        actions: [{
          type: 'LOG_MESSAGE',
          payload: { message: `Entered zone ${zoneID}` },
          conditions: [
            [ 'entity', [ 'type', 'eq', ENTITY_TYPES.PLAYER]]
          ]
        }]
      }, {
        type: 'EXIT',
        actions: [{
          type: 'LOG_MESSAGE',
          payload: { message: `Exited zone ${zoneID}` },
          conditions: [
            [ 'entity', [ 'type', 'eq', ENTITY_TYPES.PLAYER]]
          ]
        }]
      }, {
        type: 'WITHIN',
        actions: [{
          type: 'LOG_MESSAGE',
          payload: { message: `Moved within zone ${zoneID}` },
          conditions: [
            [ 'entity', [ 'type', 'eq', ENTITY_TYPES.PLAYER]]
          ]
        }]
      }],
      id: zoneID
    }
  };
  action('UPDATE_ZONES', { zones });

  action('UPDATE_CELLS', { cells });
};
