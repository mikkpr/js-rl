import { put, select } from 'redux-saga/effects';
import { CELL_PROPERTIES } from '../map';
import { cellKey } from '../utils/map';

import { GameState } from '../types';

export function* move(action): Generator {
  const state = yield select();
  const { dx, dy } = action.payload;
  const { x, y } = (state as GameState).player;
  const currentKey = cellKey(x, y);
  const nextKey = cellKey(x + dx, y + dy);
  const currentCell = (state as GameState).map[currentKey];
  const nextCell = (state as GameState).map[nextKey];

  if (CELL_PROPERTIES[nextCell.type].solid) {
    yield put({ type: 'LOG_MESSAGE', payload: { message: 'Alas! You cannot go that way.' }})
  } else {
    yield put({
      type: 'UPDATE_PLAYER_POSITION',
      payload: {
        x: dx,
        y: dy,
        relative: true
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