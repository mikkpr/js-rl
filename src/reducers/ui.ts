import produce from 'immer';
import { Panels, GameState, Action } from '../types';

export const uiState: { activePanels: Panels } = {
  activePanels: []
};

const showPanel = (state: GameState, action: Action): GameState => {
  const { panel } = action.payload;
  return produce(state, state => {
    state.activePanels = state.activePanels.filter(p => p !== panel);
    state.activePanels.push(action.payload.panel);
  });
};

const closePanel = (state: GameState, action: Action): GameState => {
  const { panel } = action.payload;
  return produce(state, state => {
    state.activePanels = state.activePanels.filter(p => p !== panel);
  });
};

const closeAllPanels = (state: GameState, action: Action): GameState => {
  return produce(state, state => {
    state.activePanels = [];
  });
};

const uiActions = {
  'SHOW_PANEL': showPanel,
  'CLOSE_PANEL': closePanel,
  'CLOSE_ALL_PANELS': closeAllPanels
};

export default uiActions;
