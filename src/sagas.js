import { takeEvery } from 'redux-saga/effects';
import LOG from './utils/log';

export function* logMessage(action) {
  yield LOG(action.message);
}

export function* logMessageSaga() {
  yield takeEvery('LOG_MESSAGE', logMessage);
}
