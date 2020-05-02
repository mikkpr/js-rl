import { Middleware, Store, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';
import rootReducer from './reducers/root';
import { rootSaga } from './sagas/root';

import { GameState, Action } from './types';

const sagaMiddleware = createSagaMiddleware();
const middlewares: Array<Middleware> = [
  sagaMiddleware
];

const LOGGING_ENABLED = true;

if (LOGGING_ENABLED) {
  const logger = createLogger({
    collapsed: true,
    timestamp: true
  });
  middlewares.push(logger);
}
export type GameStore = Store<GameState, Action>;
const game: GameStore = createStore(rootReducer, applyMiddleware(...middlewares));
sagaMiddleware.run(rootSaga);

eval('window.game = game;');

export const action = (type: string, payload: any): void => {
  requestAnimationFrame(() => game.dispatch({
    type,
    payload
  }));
};

export default game;
