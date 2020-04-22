import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';

import createSagaMiddleware from 'redux-saga';
import { logMessageSaga } from './sagas';

const sagaMiddleware = createSagaMiddleware();

const middlewares = [
  sagaMiddleware,
  createLogger({
    collapsed: true,
  }),
];

const initialState = {
  lastFoobar: undefined,
};

const foobar = (state, action) => {
  return {
    ...state,
    lastFoobar: new Date(),
  };
};

const actionMap = {
  FOOBAR: foobar,
};

const reducer = (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};

const game = createStore(
  reducer,
  applyMiddleware(...middlewares),
);

game.log = (...msgs) => {
  game.dispatch({
    type: 'LOG_MESSAGE',
    message: msgs,
  });
};

sagaMiddleware.run(logMessageSaga);

export default game;
