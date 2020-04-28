import { takeEvery } from 'redux-saga/effects';
import { entityMoved, movePlayer, moveEntity, movementFailed, randomWalk } from './movement';

export function* rootSaga(): Generator {
  yield takeEvery('COMMAND_MOVE', movePlayer);
  yield takeEvery('MOVE_ENTITY', moveEntity);
  yield takeEvery('ENTITY_MOVED', entityMoved);
  yield takeEvery('MOVEMENT_FAILED', movementFailed);
  yield takeEvery('RANDOM_WALK', randomWalk);
}
