import { takeEvery } from 'redux-saga/effects';
import { exitCell, enterCell, movePlayer, moveEntity } from './movement';

export function* rootSaga(): Generator {
  yield takeEvery('COMMAND_MOVE', movePlayer);
  yield takeEvery('MOVE_ENTITY', moveEntity);
  yield takeEvery('ENTITY_MOVE', exitCell);
  yield takeEvery('ENTITY_MOVE', enterCell);
}
