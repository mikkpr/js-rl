import { takeEvery } from 'redux-saga/effects';
import log, { clearLog } from './utils/log';

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
