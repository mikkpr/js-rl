import { State, createSetter } from './state';

export const setRunState = createSetter(
  'SET_RUN_STATE',
  (runState) => (state: State): void => {
    state.runState = runState;
  }
);
