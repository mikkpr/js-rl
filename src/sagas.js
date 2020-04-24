import * as ROT from 'rot-js';
import { takeEvery, select, put } from 'redux-saga/effects';
import log, { clearLog } from './utils/log';
import { redraw } from './index';
let FOV = undefined;

export function* logMessage(action) {
  if (typeof action.message === 'object' && typeof action.message.length !== 'undefined') {
    yield log(...action.message);
  } else {
    yield log(action.message);
  }
}

export function* clearMessageLog() {
  yield clearLog();
}

export function* logMessageSaga() {
  yield takeEvery('LOG_MESSAGE', logMessage);
  yield takeEvery('CLEAR_LOG', clearMessageLog);
}

export function* calculateFOV() {
  const { player, map } = yield select();
  if (!FOV) {
    FOV = new ROT.FOV.RecursiveShadowcasting((x, y) => {
      const cell = map[`${x}_${y}`];
      return cell && !cell.solid;
    });
  }
  const lightingMap = {};

  FOV.compute(player.x, player.y, 4, (x, y, r, visibility) => {
    lightingMap[`${x}_${y}`] = visibility;
  });

  yield put({
    type: 'UPDATE_LIGHTING_MAP',
    map: lightingMap,
  });

  yield put({
    type: 'UPDATE_EXPLORATION_MAP',
    map: Object.keys(lightingMap)
  });
}

export function* FOVSaga() {
  yield takeEvery('MOVE_PLAYER', calculateFOV);
  yield takeEvery('CALCULATE_FOV', calculateFOV);
}

export function* pulse(action) {
  const pulseOptions = action.options || {
    phase: 1,
    intensity: 1,
    duration: 60
  };
  redraw(true, pulseOptions);
}

export function* pulseSaga() {
  yield takeEvery('PULSE', pulse);
}
