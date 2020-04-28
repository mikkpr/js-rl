import { GLYPHS } from './glyphs';

export const CELL_TYPES = {
  FLOOR: 'FLOOR',
  WALL: 'WALL'
};

export const CELL_PROPERTIES = {
  [CELL_TYPES.FLOOR]: {
    glyph: GLYPHS.FLOOR,
    solid: false
  },
  [CELL_TYPES.WALL]: {
    glyph: GLYPHS.WALL,
    solid: true
  }
};