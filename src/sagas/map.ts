import { select, put } from 'redux-saga/effects';
import { ENTITY_TYPES } from '../entities';
import { CELL_PROPERTIES, CELL_TYPES } from '../cells';
import { cellKey, getAdjacentCells } from '../utils/map';
import { GameState } from '../types';

function* entityOpenDoor(id) {
  const state = yield select();
  const { entities, map } = (state as GameState);

  const entity = entities[id];
  if (!entity) { return; }

  const { x, y } = entity;
  const key = cellKey(x, y);
  const cell = map[key];

  if (!cell) { return; }

  const adjacentCells = Object.values(getAdjacentCells(map, cell)).filter(x => x);

  const closedDoors = adjacentCells.filter(c => CELL_PROPERTIES[c.type].flags.includes('OPENABLE'));
  if (closedDoors.length === 0) {
    yield put({
      type: 'LOG_MESSAGE',
      payload: {
        message: 'There is nothing to open here.'
      }
    });
  } else if (closedDoors[0].flags.filter(f => f.startsWith('LOCKED:')).length > 0) {
    yield put({
      type: 'LOG_MESSAGE',
      payload: {
        message: `The ${CELL_PROPERTIES[closedDoors[0].type].name} is locked.`
      }
    });
  } else {
    const cell = closedDoors[0];

    yield put({
      type: 'OPEN_DOOR_CELL',
      payload: { cell }
    });
    yield put({
      type: 'CALCULATE_FOV',
      payload: {}
    });
    yield put({
      type: 'LOG_MESSAGE',
      payload: {
        message: `You open the ${CELL_PROPERTIES[cell.type].name}.`
      }
    });
  }
}

function* entityCloseDoor(id) {
  const state = yield select();
  const { entities, map } = (state as GameState);

  const entity = entities[id];
  if (!entity) { return; }

  const { x, y } = entity;
  const key = cellKey(x, y);
  const cell = map[key];

  if (!cell) { return; }

  const adjacentCells = Object.values(getAdjacentCells(map, cell)).filter(x => x);

  const openDoors = adjacentCells.filter(c => CELL_PROPERTIES[c.type].flags.includes('CLOSABLE'));
  if (openDoors.length === 0) {
    yield put({
      type: 'LOG_MESSAGE',
      payload: {
        message: 'There is nothing to close here.'
      }
    });
  } else {
    const cell = openDoors[0];
    yield put({
      type: 'CLOSE_DOOR_CELL',
      payload: { cell }
    });
    yield put({
      type: 'CALCULATE_FOV',
      payload: {}
    });
    yield put({
      type: 'LOG_MESSAGE',
      payload: {
        message: `You close the ${CELL_PROPERTIES[cell.type].name}.`
      }
    });
  }
}

function* entityUnlockDoor(id) {
  const state = yield select();
  const { items, entities, map } = (state as GameState);

  const entity = entities[id];
  if (!entity) { return; }

  const { x, y } = entity;
  const key = cellKey(x, y);
  const cell = map[key];

  if (!cell) { return; }

  const adjacentCells = Object.values(getAdjacentCells(map, cell)).filter(x => x);

  const lockedDoors = adjacentCells.filter(c => c.flags.filter(f => f.startsWith('LOCKED:')).length > 0);
  if (lockedDoors.length === 0) {
    yield put({
      type: 'LOG_MESSAGE',
      payload: {
        message: 'There is nothing to unlock here.'
      }
    });
  } else {
    const cell = lockedDoors[0];
    const keyID = cell.flags.filter(f => f.startsWith('LOCKED:'))[0].split(':')[1];
    if (entity.inventory.includes(keyID)) {
      const key = items[keyID];
      yield put({
        type: 'UNLOCK_DOOR_CELL',
        payload: { cell }
      });
      yield put({
        type: 'LOG_MESSAGE',
        payload: {
          message: `You unlock the ${CELL_PROPERTIES[cell.type].name} with ${key.name}.`
        }
      });
    } else {
      yield put({
        type: 'LOG_MESSAGE',
        payload: {
          message: `You can't unlock the ${CELL_PROPERTIES[cell.type].name}.`
        }
      });
    }

  }
}

export function* closeDoor() {
  const state = yield select();
  const { entities } = (state as GameState);

  const playerID = Object.keys(entities)
    .filter(id => entities[id].type === ENTITY_TYPES.PLAYER)[0];

  yield entityCloseDoor(playerID);
}

export function* openDoor() {
  const state = yield select();
  const { entities } = (state as GameState);

  const playerID = Object.keys(entities)
    .filter(id => entities[id].type === ENTITY_TYPES.PLAYER)[0];

  yield entityOpenDoor(playerID);
}

export function* unlockDoor() {
  const state = yield select();
  const { entities } = (state as GameState);

  const playerID = Object.keys(entities)
    .filter(id => entities[id].type === ENTITY_TYPES.PLAYER)[0];

  yield entityUnlockDoor(playerID);
}
