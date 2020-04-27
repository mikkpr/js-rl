import { put, select } from 'redux-saga/effects';
import { CELL_PROPERTIES } from '../map';
import { ENTITY_TYPES } from '../reducers/entities';
import { cellKey } from '../utils/map';

import { GameState } from '../types';
export function* moveEntity(action): Generator {
  const state = yield select();
  const { dx, dy, id } = action.payload;
  const { map, entities } = (state as GameState)
  const { x, y } = entities[id];
  const currentKey = cellKey(x, y);
  const nextKey = cellKey(x + dx, y + dy);
  const currentCell = map[currentKey];
  const nextCell = map[nextKey];

  if (!CELL_PROPERTIES[nextCell.type].solid) {
    yield put({
      type: 'UPDATE_ENTITY_POSITION',
      payload: {
        x: dx,
        y: dy,
        relative: true,
        id
      }
    });

  }
}

export function* movePlayer(action): Generator {
  const state = yield select();
  const { dx, dy } = action.payload;
  const { map, entities } = (state as GameState)
  const playerID = Object.keys(entities).find((id) => {
    return entities[id].type === ENTITY_TYPES.PLAYER;
  });
  const { x, y } = entities[playerID];
  const currentKey = cellKey(x, y);
  const nextKey = cellKey(x + dx, y + dy);
  const currentCell = map[currentKey];
  const nextCell = map[nextKey];

  if (CELL_PROPERTIES[nextCell.type].solid) {
    yield put({ type: 'LOG_MESSAGE', payload: { message: 'Alas! You cannot go that way.' }});
  } else {
    yield put({
      type: 'UPDATE_ENTITY_POSITION',
      payload: {
        x: dx,
        y: dy,
        relative: true,
        id: playerID
      }
    });
  
    yield put({
      type: 'UPDATE_CAMERA_POSITION',
      payload: {
        x: -dx,
        y: -dy,
        relative: true
      }
    });
  }
}
