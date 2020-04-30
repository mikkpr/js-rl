import { select, put } from 'redux-saga/effects';
import { ENTITY_TYPES } from '../entities';
import { CELL_TYPES } from '../cells';
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

  const closedDoors = adjacentCells.filter(c => c.type === CELL_TYPES.DOOR_CLOSED);
  if (closedDoors.length === 0) {
    yield put({
      type: 'LOG_MESSAGE',
      payload: {
        message: 'There is nothing to open here.'
      }
    });
  } else {
    const door = closedDoors[0];
    yield put({
      type: 'UPDATE_CELL',
      payload: {
        cell: { ...door, type: CELL_TYPES.DOOR_OPEN }
      }
    });
    yield put({
      type: 'CALCULATE_FOV',
      payload: {}
    });
    yield put({
      type: 'LOG_MESSAGE',
      payload: {
        message: 'You open the door.'
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

  const openDoors = adjacentCells.filter(c => c.type === CELL_TYPES.DOOR_OPEN);
  if (openDoors.length === 0) {
    yield put({
      type: 'LOG_MESSAGE',
      payload: {
        message: 'There is nothing to close here.'
      }
    });
  } else {
    const door = openDoors[0];
    yield put({
      type: 'UPDATE_CELL',
      payload: {
        cell: { ...door, type: CELL_TYPES.DOOR_CLOSED }
      }
    });
    yield put({
      type: 'CALCULATE_FOV',
      payload: {}
    });
    yield put({
      type: 'LOG_MESSAGE',
      payload: {
        message: 'You close the door.'
      }
    });
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
