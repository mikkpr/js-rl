
import { GameState, Action } from '../types';
import playerActions, { playerState } from './player';
import mapActions, { mapState } from './map';
import cameraActions, { cameraState } from './camera';
import logActions, { logState } from './log';

const actionMap = {
  ...playerActions,
  ...mapActions,
  ...cameraActions,
  ...logActions
};

const initialState: GameState = {
  ...playerState,
  ...mapState,
  ...cameraState,
  ...logState
};

const rootReducer = (state = initialState, action: Action): GameState => {
  if (!actionMap[action.type]) { return state; }
  return actionMap[action.type](state, action);
};

export default rootReducer;