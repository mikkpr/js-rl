import { takeEvery } from 'redux-saga/effects';
import { move } from './movement';

export function* rootSaga(): Generator {
  yield takeEvery('COMMAND_MOVE', move);
}