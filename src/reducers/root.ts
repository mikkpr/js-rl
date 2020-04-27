
import { GameState, Action } from '../types';
import entityActions, { entitiesState } from './entities';
import mapActions, { mapState } from './map';
import cameraActions, { cameraState } from './camera';
import logActions, { logState } from './log';

const actionMap = {
  ...entityActions,
  ...mapActions,
  ...cameraActions,
  ...logActions
};

const initialState: GameState = {
  ...entitiesState,
  ...mapState,
  ...cameraState,
  ...logState
};

const rootReducer = (state = initialState, action: Action): GameState => {
  if (!actionMap[action.type]) { return state; }
  return actionMap[action.type](state, action);
};

export default rootReducer;
