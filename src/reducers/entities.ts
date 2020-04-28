import produce from 'immer';
import { ID } from '../utils/id';
import { GameState, Action, Entities } from '../types';

import { ENTITY_TYPES, ENTITY_PROPERTIES } from '../entities';

export const entitiesState: { entities: Entities } = {
  entities: {
    [ID()]: {
      x: 0,
      y: 0,
      glyph: '@',
      fg: '#fff',
      bg: '#000',
      type: ENTITY_TYPES.PLAYER
    }
  }
};

const updateEntityPosition = (state: GameState, action: Action): GameState => {
  const { x, y, relative, id } = action.payload;

  const entity = state.entities[id];
  if (!entity) { return state; }

  const newX = relative ? entity.x + x : x;
  const newY = relative ? entity.y + y : y;

  return produce(state, state => {
    const entity = state.entities[id];
    entity.x = newX;
    entity.y = newY;
  });
};

const actionMap = {
  'UPDATE_ENTITY_POSITION': updateEntityPosition
};

export default actionMap;
