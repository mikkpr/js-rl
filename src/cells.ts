import { GLYPH_TYPES } from './glyphs';

import { CellProperties } from './types';

export enum CELL_TYPES {
  FLOOR = 'FLOOR',
  WALL = 'WALL',
  DOOR_CLOSED = 'DOOR_CLOSED',
  DOOR_OPEN = 'DOOR_OPEN',
  PORTCULLIS_CLOSED = 'PORTCULLIS_CLOSED',
  PORTCULLIS_OPEN = 'PORTCULLIS_OPEN'
}

export const CELL_PROPERTIES: {
  [id: string]: CellProperties;
}= {
  [CELL_TYPES.FLOOR]: {
    glyph: GLYPH_TYPES.FLOOR as string,
    flags: []
  },
  [CELL_TYPES.WALL]: {
    glyph: GLYPH_TYPES.WALL as string,
    flags: [
      'SOLID',
      'BLOCKS_LIGHT',
      'COLOR_BG'
    ]
  },
  [CELL_TYPES.DOOR_OPEN]: {
    glyph: GLYPH_TYPES.DOOR_OPEN as string,
    flags: [
      'CLOSABLE'
    ],
    name: 'door'
  },
  [CELL_TYPES.DOOR_CLOSED]: {
    glyph: GLYPH_TYPES.DOOR_CLOSED as string,
    flags: [
      'SOLID',
      'OPENABLE',
      'BLOCKS_LIGHT'
    ],
    name: 'door'
  },
  [CELL_TYPES.PORTCULLIS_OPEN]: {
    glyph: GLYPH_TYPES.PORTCULLIS_OPEN as string,
    flags: [
      'CLOSABLE'
    ],
    name: 'portcullis'
  },
  [CELL_TYPES.PORTCULLIS_CLOSED]: {
    glyph: GLYPH_TYPES.PORTCULLIS_CLOSED as string,
    flags: [
      'SOLID',
      'OPENABLE'
    ],
    name: 'portcullis'
  }
};
