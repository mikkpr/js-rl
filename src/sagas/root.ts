import { takeEvery } from 'redux-saga/effects';
import { movePlayer, moveEntity } from './movement';

export function* rootSaga(): Generator {
  yield takeEvery('COMMAND_MOVE', movePlayer);
  yield takeEvery('MOVE_ENTITY', moveEntity);
}
