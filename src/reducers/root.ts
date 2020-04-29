
import { GameState, Action } from '../types';
import entityActions, { entitiesState } from './entities';
import mapActions, { mapState } from './map';
import cameraActions, { cameraState } from './camera';
import logActions, { logState } from './log';
import itemActions, { itemsState } from './items';
import uiActions, { uiState } from './ui';

const actionMap = {
  ...entityActions,
  ...mapActions,
  ...cameraActions,
  ...logActions,
  ...itemActions,
  ...uiActions
};

const initialState: GameState = {
  ...entitiesState,
  ...mapState,
  ...cameraState,
  ...logState,
  ...itemsState,
  ...uiState
};

const rootReducer = (state = initialState, action: Action): GameState => {
  if (!actionMap[action.type]) { return state; }
  return actionMap[action.type](state, action);
};

export default rootReducer;
