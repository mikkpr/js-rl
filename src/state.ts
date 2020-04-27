import { Middleware, Store, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';
import rootReducer from './reducers/root';
import { rootSaga } from './sagas/root';

export interface GameState {
  player: {
    x: number;
    y: number;
  };
}

export const defaultState: GameState = {
  player: {
    x: 0,
    y: 0
  }
};

export interface Action {
  type: string;
  payload: any;
}
const sagaMiddleware = createSagaMiddleware();
const middlewares: Array<Middleware> = [
  sagaMiddleware
];

const loggingEnabled = true;
if (loggingEnabled) {
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
  game.dispatch({
    type,
    payload
  });
};

export default game;
