import produce from 'immer';
import { ID } from '../utils/id';
import { GameState, Action, Entities } from '../types';

import { ENTITY_TYPES } from '../entities';
import { GLYPHS } from '../glyphs';

export const entitiesState: { entities: Entities, playerID: string | null } = {
  entities: {},
  playerID: null
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

const updateEntities = (state: GameState, action: Action): GameState => {
  const { entities } = action.payload;
  return produce(state, state => {
    state.entities = {
      ...state.entities,
      ...(entities
        .reduce((entities, entity) => {
          const id = entity.id || ID();
          return {
            ...entities,
            [id]: entity
          };
        }, {})
      )
    };
  });
};

const updatePlayerID = (state: GameState, action: Action): GameState => {
  const { id } = action.payload;
  return produce(state, state => {
    state.playerID = id;
  });
};

const actionMap = {
  'UPDATE_ENTITY_POSITION': updateEntityPosition,
  'UPDATE_ENTITIES': updateEntities,
  'UPDATE_PLAYER_ID': updatePlayerID
};

export default actionMap;
