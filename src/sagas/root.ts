import { takeEvery } from 'redux-saga/effects';
import { entityMoved, movePlayer, moveEntity, movementFailed, randomWalk } from './movement';
import { calculateFOV } from './fov';
import { pickUpTopmostItem, pickUpItem, dropItem } from './items';

export function* rootSaga(): Generator {
  yield takeEvery('COMMAND_MOVE', movePlayer);
  yield takeEvery('MOVE_ENTITY', moveEntity);
  yield takeEvery('ENTITY_MOVED', entityMoved);
  yield takeEvery('MOVEMENT_FAILED', movementFailed);
  yield takeEvery('RANDOM_WALK', randomWalk);
  yield takeEvery('CALCULATE_FOV', calculateFOV);
  yield takeEvery('UPDATE_ENTITY_POSITION', calculateFOV);
  yield takeEvery('UPDATE_CELLS', calculateFOV);
  yield takeEvery('COMMAND_GET', pickUpTopmostItem);
  yield takeEvery('PICK_UP_ITEM', pickUpItem);
  yield takeEvery('DROP_ITEM', dropItem);
}
