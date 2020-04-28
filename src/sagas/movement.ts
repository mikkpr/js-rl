import { put, select } from 'redux-saga/effects';
import { CELL_PROPERTIES } from '../map';
import { TRIGGER_TYPES } from '../zones';
import { ENTITY_TYPES } from '../entities';
import { cellKey } from '../utils/map';
import { isConditionTrue } from '../utils/conditions';
import { isWithinZone } from '../zones';

import { GameState, Trigger, Action, ConditionalAction } from '../types';
export function* moveEntity(action): Generator {
  const state = yield select();
  const { dx, dy, id } = action.payload;
  const { map, entities } = (state as GameState);
  const entity = entities[id];
  const { x, y } = entity;
  const currentKey = cellKey(x, y);
  const nextKey = cellKey(x + dx, y + dy);
  const currentCell = map[currentKey];
  const nextCell = map[nextKey];

  if (!CELL_PROPERTIES[nextCell.type].solid) {
    if (entity.type === ENTITY_TYPES.PLAYER) {
      yield put({
        type: 'UPDATE_CAMERA_POSITION',
        payload: {
          x: -dx,
          y: -dy,
          relative: true
        }
      });
    }
    yield put({
      type: 'ENTITY_MOVED',
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
  } else {
    yield put({
      type: 'MOVEMENT_FAILED',
      payload: {
        src: {
          x, y
        },
        dest: {
          x: x + dx,
          y: y + dy
        },
        id
      }
    });
  }
}

export function* movePlayer(action): Generator {
  const { dx, dy } = action.payload;
  const state = yield select();
  const { entities } = (state as GameState);
  const id = Object.keys(entities).find((id) => {
    return entities[id].type === ENTITY_TYPES.PLAYER;
  });
  
  yield put({
    type: 'MOVE_ENTITY',
    payload: {
      dx, dy, id
    }
  });
}

function* handleTrigger(action, conditionChecker): Generator {
  const { conditions } = (action as ConditionalAction);
  if (
    !conditions ||
    conditions.length === 0 ||
    conditions.reduce(
      (isTrue, condition) => isTrue && conditionChecker(condition),
      true
    )
  ) {
    yield put((action as Action));
  }
}

export function* entityMoved(action): Generator {
  const { id, src, dest } = action.payload;
  const state = yield select();
  const { zones, entities } = (state as GameState);
  const checkCurrentCellInZone = isWithinZone(src.x, src.y);
  const checkNextCellInZone = isWithinZone(dest.x, dest.y);
  const triggers = Object.values(zones).reduce((acc, zone) => {
    const enterTriggers = zone.triggers.filter(t => t.type === TRIGGER_TYPES.ENTER);
    const exitTriggers = zone.triggers.filter(t => t.type === TRIGGER_TYPES.EXIT);
    const withinTriggers = zone.triggers.filter(t => t.type === TRIGGER_TYPES.WITHIN);

    const currentInZone = checkCurrentCellInZone(zone);
    const nextInZone = checkNextCellInZone(zone);

    if (!currentInZone && nextInZone) {
      acc.enter.push(...enterTriggers);
    }
    if (!nextInZone && currentInZone) {
      acc.exit.push(...exitTriggers);
    }
    if (currentInZone && nextInZone) {
      acc.within.push(...withinTriggers);
    }
    return acc;
  }, {enter: [], exit: [], within: []});

  const conditionChecker = isConditionTrue(entities[id], src, dest);
  for (const trigger of triggers.enter) {
    for (const action of (trigger as Trigger).actions) {
      yield handleTrigger(action, conditionChecker);
    }
  }
  for (const trigger of triggers.exit) {
    for (const action of (trigger as Trigger).actions) {
      yield handleTrigger(action, conditionChecker);
    }
  }
  for (const trigger of triggers.within) {
    for (const action of (trigger as Trigger).actions) {
      yield handleTrigger(action, conditionChecker);
    }
  }
}

export function* movementFailed(action): Generator {
  const { id, src, dest } = action.payload;
  const state = yield select();
  const { entities } = (state as GameState);
  if (entities[id].type === ENTITY_TYPES.PLAYER) {
    yield put({ type: 'LOG_MESSAGE', payload: { message: 'Alas! You cannot go that way.' }});
  }
}
