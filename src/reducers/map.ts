import produce from 'immer';
import { GameState, Action } from '../types';
import { cellKey } from '../utils/map';

export const mapState = {
  map: {},
  zones: {},
  lightingMap: {},
  explorationMap: {},
  visibilityMap: {}
};

const updateCell = (state: GameState, action: Action): GameState => {
  const { cell } = action.payload;
  const { x, y } = cell;
  const key = cellKey(x, y);
  return produce(state, state => {
    state.map[key] = cell;
  });
};

const updateCells = (state: GameState, action: Action): GameState => {
  const { cells } = action.payload;
  return cells.reduce((state, cell) => updateCell(state, { type: 'UPDATE_CELL', payload: { cell }}), state);
};

const updateZone = (state: GameState, action: Action): GameState => {
  const { id, zone } = action.payload;
  return produce(state, state => {
    state.zones[id] = zone;
  });
};

const updateZones = (state: GameState, action: Action): GameState => {
  const { zones } = action.payload;
  return {
    ...state,
    zones
  };
};

const updateVisibilityMap = (state, action) => {
  const { visibilityMap } = action.payload;
  return produce(state, state => {
    state.visibilityMap = visibilityMap;
  });
};

const updateLightingMap = (state, action) => {
  const { lightingMap } = action.payload;
  return produce(state, state => {
    state.lightingMap = lightingMap;
  });
};

const updateExplorationMap = (state, action) => {
  const { explorationMap } = action.payload;
  return produce(state, state => {
    for (const id of explorationMap) {
      state.explorationMap[id] = 1;
    }
  });
};

const actionMap = {
  'UPDATE_CELL': updateCell,
  'UPDATE_CELLS': updateCells,
  'UPDATE_ZONE': updateZone,
  'UPDATE_ZONES': updateZones,
  'UPDATE_LIGHTING_MAP': updateLightingMap,
  'UPDATE_EXPLORATION_MAP': updateExplorationMap,
  'UPDATE_VISIBILITY_MAP': updateVisibilityMap
};

export default actionMap;
