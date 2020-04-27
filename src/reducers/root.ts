import produce from 'immer';
import { defaultState, GameState, Action } from '../state';

const updatePlayerPosition = (state: GameState, action: Action): GameState => {
  const { x, y, relative } = action.payload;

  const newX = relative ? state.player.x + x : x;
  const newY = relative ? state.player.y + y : y;

  return produce(state, state => {
    state.player.x = newX;
    state.player.y = newY;
  });
};

const actionMap = {
  'UPDATE_PLAYER_POSITION': updatePlayerPosition
};

const rootReducer = (state = defaultState, action: Action): GameState => {
  if (!actionMap[action.type]) { return state; }
  return actionMap[action.type](state, action);
}

export default rootReducer;