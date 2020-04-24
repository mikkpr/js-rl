const initialState = {
  map: {},
  lightingMap: {},
  explorationMap: [],
  cameraOffset: {
    x: 0,
    y: 0
  },
  player: {
    x: 10,
    y: 10
  },
};

const updateCell = (state, action) => {
  const { x, y, cell } = action;
  const key = `${x}_${y}`;

  const { map } = state;

  const prevCell = map[key] || {};
  return {
    ...state,
    map: {
      ...state.map,
      [key]: { ...prevCell, ...cell },
    },
  };
};

const updateCells = (state, action) => {
  const { cells } = action;
  return cells
    .map(cell => ({x: cell.x, y: cell.y, cell}))
    .reduce(updateCell, state);
};

const updateLightingMap = (state, action) => {
  const { map } = action;
  return {
    ...state,
    lightingMap: map
  };
};

const updateExplorationMap = (state, action) => {
  const { map } = action;
  return {
    ...state,
    explorationMap: [...(new Set([...state.explorationMap, ...action.map]))]
  };
};

const movePlayer = (state, action) => {
  const { dx, dy } = action;
  const { player, map } = state;
  const { x, y } = player;

  const cellKey = `${x + dx}_${y + dy}`;
  const cell = map[cellKey];
  if (cell && cell.char === '#') {
    requestAnimationFrame(() => game.log('Alas! You cannot go that way.'));
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      x: state.player.x + dx,
      y: state.player.y + dy,
    },
  };
};

const actionMap = {
  MOVE_PLAYER: movePlayer,
  UPDATE_CELL: updateCell,
  UPDATE_CELLS: updateCells,
  UPDATE_LIGHTING_MAP: updateLightingMap,
  UPDATE_EXPLORATION_MAP: updateExplorationMap,
};

const reducer = (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};

export default reducer;
