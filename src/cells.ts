import { GLYPH_TYPES } from './glyphs';

export enum CELL_TYPES {
  FLOOR = 'FLOOR',
  WALL = 'WALL',
  DOOR_CLOSED = 'DOOR_CLOSED',
  DOOR_OPEN = 'DOOR_OPEN'
}

export const CELL_PROPERTIES = {
  [CELL_TYPES.FLOOR]: {
    glyph: GLYPH_TYPES.FLOOR as string,
    solid: false
  },
  [CELL_TYPES.WALL]: {
    glyph: GLYPH_TYPES.WALL as string,
    solid: true
  },
  [CELL_TYPES.DOOR_OPEN]: {
    glyph: GLYPH_TYPES.DOOR_OPEN as string,
    solid: false
  },
  [CELL_TYPES.DOOR_CLOSED]: {
    glyph: GLYPH_TYPES.DOOR_CLOSED as string,
    solid: true
  }
};
