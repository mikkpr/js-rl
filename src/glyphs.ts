enum UI_TYPES {
  UI_CORNER_TOP_LEFT = 'UI_CORNER_TOP_LEFT',
  UI_CORNER_TOP_RIGHT = 'UI_CORNER_TOP_RIGHT',
  UI_CORNER_BOTTOM_LEFT = 'UI_CORNER_BOTTOM_LEFT',
  UI_CORNER_BOTTOM_RIGHT = 'UI_CORNER_BOTTOM_RIGHT',
  UI_LINE_HORIZONTAL = 'UI_LINE_HORIZONTAL',
  UI_LINE_VERTICAL = 'UI_LINE_VERTICAL',
  UI_BACKGROUND = 'UI_BACKGROUND'
}

enum CELL_TYPES {
  FLOOR = 'FLOOR',
  WALL = 'WALL',
}

enum ENTITY_TYPES {
  PLAYER = 'PLAYER',
}

enum ZONE_TYPES {
  FOLIAGE = 'FOLIAGE',
  PORTAL = 'PORTAL',
}

enum ITEM_TYPES {
  KEY = 'KEY'
}

export const GLYPH_TYPES = {
  ...UI_TYPES,
  ...CELL_TYPES,
  ...ENTITY_TYPES,
  ...ZONE_TYPES,
  ...ITEM_TYPES
};

export type GLYPH_TYPES = UI_TYPES | CELL_TYPES | ENTITY_TYPES | ZONE_TYPES | ITEM_TYPES;

const CELL_GLYPHS = {
  [GLYPH_TYPES.FLOOR]: {
    glyph: '.',
    fg: '#111',
    bg: '#000'
  },
  [GLYPH_TYPES.WALL]: {
    glyph: '█',
    fg: '#444',
    bg: '#000'
  }
};

const ENTITY_GLYPHS = {
  [GLYPH_TYPES.PLAYER]: {
    glyph: '@',
    fg: '#e6ebff',
    bg: null
  }
};

const ZONE_GLYPHS = {
  [GLYPH_TYPES.FOLIAGE]: {
    glyph: '~',
    fg: '#426f47',
    bg: '#262'
  },
  [GLYPH_TYPES.PORTAL]: {
    glyph: '~',
    fg: '#8c0f51',
    bg: '#000'
  }
};

const ITEM_GLYPHS = {
  [GLYPH_TYPES.KEY]: {
    glyph: 'F',
    fg: '#9ca417',
    bg: '#000'
  }
};

const UI_GLYPHS = {
  [GLYPH_TYPES.UI_CORNER_TOP_LEFT]: {
    glyph: '┌',
    fg: '#fff',
    bg: '#000'
  },
  [GLYPH_TYPES.UI_CORNER_TOP_RIGHT]: {
    glyph: '┐',
    fg: '#fff',
    bg: '#000'
  },
  [GLYPH_TYPES.UI_CORNER_BOTTOM_LEFT]: {
    glyph: '└',
    fg: '#fff',
    bg: '#000'
  },
  [GLYPH_TYPES.UI_CORNER_BOTTOM_RIGHT]: {
    glyph: '┘',
    fg: '#fff',
    bg: '#000'
  },
  [GLYPH_TYPES.UI_LINE_HORIZONTAL]: {
    glyph: '─',
    fg: '#fff',
    bg: '#000'
  },
  [GLYPH_TYPES.UI_LINE_VERTICAL]: {
    glyph: '│',
    fg: '#fff',
    bg: '#000'
  },
  [GLYPH_TYPES.UI_BACKGROUND]: {
    glyph: null,
    fg: null,
    bg: '#000'
  }
};

export const GLYPHS = {
  ...CELL_GLYPHS,
  ...ENTITY_GLYPHS,
  ...ZONE_GLYPHS,
  ...ITEM_GLYPHS,
  ...UI_GLYPHS
};
