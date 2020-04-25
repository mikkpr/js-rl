import * as ROT from 'rot-js';
import { takeEvery, select, put } from 'redux-saga/effects';
import log, { clearLog } from './utils/log';
import { redraw } from './utils/render';
import { CELL_TYPES, CELL_PROPERTIES } from './map';
let FOV = undefined;

export function* logMessage(action) {
  if (typeof action.message === 'object' && typeof action.message.length !== 'undefined') {
    yield log(...action.message);
  } else {
    yield log(action.message);
  }
}

export function* clearMessageLog() {
  yield clearLog();
}

export function* logMessageSaga() {
  yield takeEvery('LOG_MESSAGE', logMessage);
  yield takeEvery('CLEAR_LOG', clearMessageLog);
}

const lightPasses = (map) => (x, y) => {
  const cell = map[`${x}_${y}`];
  return cell && !CELL_PROPERTIES[cell.type].solid;
}

export function* calculateFOV(action) {
  const recalculateFOV = ['UPDATE_CELL', 'UPDATE_CELLS'].includes(action.type);
  const { player, map } = yield select();
  if (!player) { return; }
  if (!FOV || recalculateFOV) {
    FOV = new ROT.FOV.RecursiveShadowcasting(lightPasses(map));
  }
  const lightingMap = {};

  FOV.compute(player.x, player.y, 4, (x, y, r, visibility) => {
    lightingMap[`${x}_${y}`] = visibility;
  });

  yield put({
    type: 'UPDATE_LIGHTING_MAP',
    map: lightingMap,
  });

  yield put({
    type: 'UPDATE_EXPLORATION_MAP',
    map: Object.keys(lightingMap)
  });
}

export function* FOVSaga() {
  yield takeEvery('MOVE_PLAYER', calculateFOV);
  yield takeEvery('CALCULATE_FOV', calculateFOV);
  yield takeEvery('UPDATE_CELL', calculateFOV);
  yield takeEvery('UPDATE_CELLS', calculateFOV);
}

export function* pulse(action) {
  const pulseOptions = action.options || {
    phase: 1,
    intensity: 1,
    duration: 60
  };
  yield redraw(true, pulseOptions);
}

export function* pulseSaga() {
  yield takeEvery('PULSE', pulse);
}

const getAdjacentCells = (state, type) => {
  const { player, map } = state;
  const { x, y } = player;
  const adjacent = [
    `${x + 1}_${y}`,
    `${x - 1}_${y}`,
    `${x}_${y + 1}`,
    `${x}_${y - 1}`,
  ].map(key => {
    return map[key];
  }).filter(c => !!c);

  if (type) {
    return adjacent.filter(cell => cell.type === type);
  }

  return adjacent;
};

function* comOpen() {
  const state = yield select();
  const adjacent = yield getAdjacentCells(state, CELL_TYPES.DOOR_CLOSED);

  if (adjacent.length === 0) {
    yield put({ type: 'LOG_MESSAGE', message: 'Nothing to open.'});
  } else {
    const updatedCells = adjacent.map((cell) => ({ ...cell, type: CELL_TYPES.DOOR_OPEN }));
    updatedCells.forEach(cell => {
      const portals = state.portals;
      const connectedPortals = portals
        .filter(p => {
          return (p.from[0] === cell.x && p.from[1] === cell.y);
        })
        .map(p => state.map[p.to.join('_')])
        .map((cell) => ({ ...cell, type: CELL_TYPES.DOOR_OPEN }));
      updatedCells.push(...connectedPortals);
    });
    yield put({ type: 'LOG_MESSAGE', message: `You open the door${adjacent.length > 1 ? 's' : ''}.`});
    yield put({ type: 'UPDATE_CELLS', cells: updatedCells });
  }
}

function* comClose() {
  const state = yield select();
  const adjacent = yield getAdjacentCells(state, CELL_TYPES.DOOR_OPEN);

  if (adjacent.length === 0) {
    yield put({ type: 'LOG_MESSAGE', message: 'Nothing to close.'});
  } else {
    const updatedCells = adjacent.map((cell) => ({ ...cell, type: CELL_TYPES.DOOR_CLOSED }));
    updatedCells.forEach(cell => {
      const portals = state.portals;
      const connectedPortals = portals
        .filter(p => {
          return (p.from[0] === cell.x && p.from[1] === cell.y);
        })
        .map(p => state.map[p.to.join('_')])
        .map((cell) => ({ ...cell, type: CELL_TYPES.DOOR_CLOSED }));
      updatedCells.push(...connectedPortals);
    });
    yield put({ type: 'LOG_MESSAGE', message: `You close the door${adjacent.length > 1 ? 's' : ''}.`});
    yield put({ type: 'UPDATE_CELLS', cells: updatedCells });
  }
}

function* comGet() {
  const state = yield select();
  const { map, player, items } = state;
  const currentCell = map[`${player.x}_${player.y}`];
  if (!currentCell.contents || currentCell.contents.length === 0) {
    yield put({ type: 'LOG_MESSAGE', message: 'There is nothing here to get.' })
  } else {
    const itemID = currentCell.contents[0];
    const item = items[currentCell.contents[0]];
    yield put({ type: 'UPDATE_CELL', cell: { ...currentCell, contents: currentCell.contents.filter(id => id !== itemID) } });
    yield put({ type: 'PICK_UP_ITEM', item: itemID });
    yield put({ type: 'LOG_MESSAGE', message: `You pick up ${item.name}.` });
  }
}

function* comDrop(action) {
  const state = yield select();
  const { map, player, items, inventory } = state;
  const droppedID = inventory[action.idx];
  if (droppedID) {
    const currentCell = map[`${player.x}_${player.y}`];
    yield put({ type: 'DROP_ITEM', item: droppedID });
    yield put({
      type: 'UPDATE_CELL',
      cell: {
        ...currentCell,
        contents: (currentCell.contents && currentCell.contents.length > 0)
          ? [ ...currentCell.contents, droppedID ]
          : [droppedID],
      } });
    yield put({ type: 'LOG_MESSAGE', message: `You drop ${items[droppedID].name}.` })
  }
}

export function* commandSaga() {
  yield takeEvery('COMMAND_CLOSE', comClose);
  yield takeEvery('COMMAND_OPEN', comOpen);
  yield takeEvery('COMMAND_GET', comGet);
  yield takeEvery('COMMAND_DROP', comDrop);
}
