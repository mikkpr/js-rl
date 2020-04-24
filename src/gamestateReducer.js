const dirToString = (dir) => {
  const [x, y] = dir;
  if (x === 0 && y === 1) {
    return 'south';
  } else if (x === 0 && y === -1) {
    return 'north';
  } else if (x === 1 && y === 0) {
    return 'east';
  } else if (x === -1 && y === 0) {
    return 'west';
  }

  return '';
}
const initialState = {
  map: {},
  lightingMap: {},
  explorationMap: [],
  mapOffset: [0, 0],
  player: {
    x: 10,
    y: 10,
  },
  portals: []
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

const updatePortals = (state, action) => {
  return {
    ...state,
    portals: action.portals,
  };
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
  const { mapOffset, player, map, portals } = state;
  const { x, y } = player;

  const cellKey = `${x + dx}_${y + dy}`;
  let newX = player.x + dx;
  let newY = player.y + dy;

  const cell = map[cellKey];

  const currentPortals = portals.filter(portal => {
    const isCurrent = (
      portal.from[0] === player.x &&
      portal.from[1] === player.y
    );

    return isCurrent;
  });

  const nextPortals = portals.forEach(portal => {
    const isNext = (
      portal.from[0] === newX &&
      portal.from[1] === newY
    );

    if (isNext && portal.type === 'PORTAL') {
      const dir = dirToString(portal.dir);
      requestAnimationFrame(() => game.log(`There is something strange to the ${dir}.`));
    }
  });

  const portal = currentPortals.filter(portal => {
    return (
      portal.from[0] === player.x &&
      portal.from[1] === player.y &&
      portal.dir[0] === dx &&
      portal.dir[1] === dy
    );
  });
  let newMapoffset = mapOffset;
  if (portal && portal.length > 0) {
    [newX, newY] = portal[0].to;
    newMapoffset = [Math.floor(newX / 21), Math.floor(newY / 21)];
    if (portal[0].type === 'PORTAL') {
      requestAnimationFrame(() => {
        game.dispatch({
          type: 'PULSE',
          options: {
            intensity: 20,
            phase: 50,
            duration: 420,
          },
        });
        game.log('You step through the portal.');
      });

    }
  } else if (cell && cell.solid) {
    requestAnimationFrame(() => game.log('Alas! You cannot go that way.'));
    [newX, newY] = [player.x, player.y];
  }

  return {
    ...state,
    player: {
      ...player,
      x: newX,
      y: newY,
    },
    mapOffset: newMapoffset,
  };
};

const updateMapOffset = (state, action) => {
  return {
    ...state,
    mapOffset: [state.mapOffset[0] + dx, state.mapOffset[1] + dy]
  };
};

const setPlayerPosition = (state, action) => {
  const { position } = action;
  const [newX, newY] = position;
  const newMapoffset = [Math.floor(newX / 21), Math.floor(newY / 21)];
  return {
    ...state,
    player: {
      ...state.player,
      x: action.position[0],
      y: action.position[1],
    },
    mapOffset: newMapoffset,
  };
};

const actionMap = {
  MOVE_PLAYER: movePlayer,
  UPDATE_CELL: updateCell,
  UPDATE_CELLS: updateCells,
  UPDATE_LIGHTING_MAP: updateLightingMap,
  UPDATE_EXPLORATION_MAP: updateExplorationMap,
  UPDATE_MAP_OFFSET: updateMapOffset,
  UPDATE_PORTALS: updatePortals,
  SET_PLAYER_POSITION: setPlayerPosition,
};

const reducer = (state = initialState, action) => {
  if (actionMap[action.type]) {
    return actionMap[action.type](state, action);
  }

  return state;
};

export default reducer;
