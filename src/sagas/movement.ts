import { put, takeEvery } from 'redux-saga/effects';

export function* move(action): Generator {
  const { dx, dy } = action.payload;

  yield put({
    type: 'UPDATE_PLAYER_POSITION',
    payload: {
      x: dx,
      y: dy,
      relative: true
    }
  });
}