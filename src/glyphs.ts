export const GLYPH_TYPES = {
  FLOOR: 'FLOOR',
  WALL: 'WALL',
  PLAYER: 'PLAYER',
  FOLIAGE: 'FOLIAGE',
  PORTAL: 'PORTAL'
};

export const GLYPHS = {
  [GLYPH_TYPES.FLOOR]: {
    glyph: '.',
    fg: '#444',
    bg: '#000'
  },
  [GLYPH_TYPES.WALL]: {
    glyph: '#',
    fg: '#aaa',
    bg: '#000'
  },
  [GLYPH_TYPES.PLAYER]: {
    glyph: '@',
    fg: '#fff',
    bg: null
  },
  [GLYPH_TYPES.FOLIAGE]: {
    glyph: '~',
    fg: '#6a6',
    bg: '#262'
  },
  [GLYPH_TYPES.PORTAL]: {
    glyph: '~',
    fg: '#646',
    bg: '#000'
  }
};