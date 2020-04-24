import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';

import createSagaMiddleware from 'redux-saga';
import { commandSaga, logMessageSaga, FOVSaga, pulseSaga } from './sagas';

import reducer from './gamestateReducer';

const sagaMiddleware = createSagaMiddleware();

const enableLogging = true;
const middlewares = [
  sagaMiddleware,
];

if (enableLogging) {
  middlewares.push(createLogger({
    collapsed: true,
  }));
}

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

game.clearLog = () => game.dispatch({ type: 'CLEAR_LOG' });

sagaMiddleware.run(logMessageSaga);
sagaMiddleware.run(FOVSaga);
sagaMiddleware.run(pulseSaga);
sagaMiddleware.run(commandSaga);

export default game;
