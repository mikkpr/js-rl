import { GLYPH_TYPES } from './glyphs';

export enum CELL_TYPES {
  FLOOR = 'FLOOR',
  WALL = 'WALL'
}

export const CELL_PROPERTIES = {
  [CELL_TYPES.FLOOR]: {
    glyph: GLYPH_TYPES.FLOOR as string,
    solid: false
  },
  [CELL_TYPES.WALL]: {
    glyph: GLYPH_TYPES.WALL as string,
    solid: true
  }
};
