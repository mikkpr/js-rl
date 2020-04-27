import { action } from './state';

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
  action('UPDATE_CELLS', { cells });
}