import produce from 'immer';
import { ID } from '../utils/id';
import { GameState, Action, Entities } from '../types';

export const ENTITY_TYPES = {
  PLAYER: 'PLAYER'
};

export const ENTITY_PROPERTIES = {
  [ENTITY_TYPES.PLAYER]: {
    controllable: true
  }
};

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
