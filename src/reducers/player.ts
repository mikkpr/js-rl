import produce from 'immer';
import { GameState, Action } from '../types';

export const playerState = {
  player: {
    x: 0,
    y: 0,
    glyph: '@',
    fg: '#fff',
    bg: '#000'
  }
};

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

export default actionMap;