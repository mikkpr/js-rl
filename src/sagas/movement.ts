import { put, select } from 'redux-saga/effects';
import { CELL_PROPERTIES } from '../map';
import { TRIGGER_TYPES } from '../zones';
import { ENTITY_TYPES } from '../reducers/entities';
import { cellKey } from '../utils/map';
import { isWithinZone } from '../zones';

import { Cell, Entity, GameState } from '../types';
export function* moveEntity(action): Generator {
  const state = yield select();
  const { dx, dy, id } = action.payload;
  const { zones, map, entities } = (state as GameState);
  const { x, y } = entities[id];
  const currentKey = cellKey(x, y);
  const nextKey = cellKey(x + dx, y + dy);
  const currentCell = map[currentKey];
  const nextCell = map[nextKey];

  if (!CELL_PROPERTIES[nextCell.type].solid) {
    yield put({
      type: 'ENTITY_MOVE',
      payload: {
        id,
        src: currentCell,
        dest: nextCell
      }
    });

    yield put({
      type: 'UPDATE_ENTITY_POSITION',
      payload: {
        x: dx,
        y: dy,
        relative: true,
        id
      }
    });
  }
}

export function* movePlayer(action): Generator {
  const state = yield select();
  const { dx, dy } = action.payload;
  const { zones, map, entities } = (state as GameState);
  const id = Object.keys(entities).find((id) => {
    return entities[id].type === ENTITY_TYPES.PLAYER;
  });
  const { x, y } = entities[id];
  const currentKey = cellKey(x, y);
  const nextKey = cellKey(x + dx, y + dy);
  const currentCell = map[currentKey];
  const nextCell = map[nextKey];

  if (CELL_PROPERTIES[nextCell.type].solid) {
    yield put({ type: 'LOG_MESSAGE', payload: { message: 'Alas! You cannot go that way.' }});
  } else {

    yield put({
      type: 'ENTITY_MOVE',
      payload: {
        id,
        src: currentCell,
        dest: nextCell
      }
    });

    yield put({
      type: 'UPDATE_ENTITY_POSITION',
      payload: {
        x: dx,
        y: dy,
        relative: true,
        id
      }
    });
  
    yield put({
      type: 'UPDATE_CAMERA_POSITION',
      payload: {
        x: -dx,
        y: -dy,
        relative: true
      }
    });
  }
}

export function* exitCell(action): Generator {
  const { id, src, dest } = action.payload;
  const state = yield select();
  const { zones, entities } = (state as GameState);
  const checkCurrentCellInZone = isWithinZone(src.x, src.y);
  Object.values(zones).forEach(zone => {
    const exitTriggers = zone.triggers.filter(t => t.type === TRIGGER_TYPES.EXIT);
    if (checkCurrentCellInZone(zone)) {
      exitTriggers.forEach(t => t.callback(entities[id], src, dest));
    }
  });
}

export function* enterCell(action): Generator {
  const { id, src, dest } = action.payload;
  const state = yield select();
  const { zones, entities } = (state as GameState);
  const checkNextCellInZone = isWithinZone(dest.x, dest.y);
  Object.values(zones).forEach(zone => {
    const enterTriggers = zone.triggers.filter(t => t.type === TRIGGER_TYPES.ENTER);
    if (checkNextCellInZone(zone)) {
      enterTriggers.forEach(t => t.callback(entities[id], src, dest));
    }
  });
}
