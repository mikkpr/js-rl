import { State, createSetter } from './state';

export const updatePlayerPosition = createSetter(
  'UPDATE_PLAYER_POSITION',
  (dx: number, dy: number) => (state: State): void => {
    state.player = {
      ...state.player,
      x: state.player.x + dx,
      y: state.player.y + dy,
    };
  }
);

export const setPlayerPosition = createSetter(
  'SET_PLAYER_POSITION',
  (x: number, y: number) => (state: State): void => {
    state.player = {
      ...state.player,
      x,
      y,
    };
  }
);

export const setRunState = createSetter(
  'SET_RUN_STATE',
  (runState) => (state: State): void => {
    state.runState = runState;
  }
);