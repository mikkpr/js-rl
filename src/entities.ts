import { ID } from './utils/id';
import { Entity } from './types';

export enum ENTITY_TYPES {
  PLAYER = 'PLAYER',
  FOLIAGE = 'FOLIAGE'
}

export const ENTITY_PROPERTIES = {
  [ENTITY_TYPES.PLAYER]: {
    controllable: true
  }
};

export const createEntity = ({
  x,
  y,
  glyph,
  type,
  inventory = []
}): Entity => {
  return {
    x,
    y,
    glyph,
    type,
    inventory,
    id: ID()
  };
};
