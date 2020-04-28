export const GLYPH_TYPES = {
  FLOOR: 'FLOOR',
  WALL: 'WALL',
  PLAYER: 'PLAYER',
  FOLIAGE: 'FOLIAGE'
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
    bg: '#000'
  },
  [GLYPH_TYPES.FOLIAGE]: {
    glyph: '~',
    fg: '#6a6',
    bg: '#262'
  }
};