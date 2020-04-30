export enum GLYPH_TYPES {
  FLOOR = 'FLOOR',
  WALL = 'WALL',
  PLAYER = 'PLAYER',
  FOLIAGE = 'FOLIAGE',
  PORTAL = 'PORTAL',
  KEY = 'KEY'
};

export const GLYPHS = {
  [GLYPH_TYPES.FLOOR]: {
    glyph: '.',
    fg: '#111',
    bg: '#000'
  },
  [GLYPH_TYPES.WALL]: {
    glyph: '█',
    fg: '#444',
    bg: '#000'
  },
  [GLYPH_TYPES.PLAYER]: {
    glyph: '@',
    fg: '#e6ebff',
    bg: null
  },
  [GLYPH_TYPES.FOLIAGE]: {
    glyph: '~',
    fg: '#426f47',
    bg: '#262'
  },
  [GLYPH_TYPES.PORTAL]: {
    glyph: '~',
    fg: '#8c0f51',
    bg: '#000'
  },
  [GLYPH_TYPES.KEY]: {
    glyph: 'F',
    fg: '#9ca417',
    bg: '#000'
  }
};
