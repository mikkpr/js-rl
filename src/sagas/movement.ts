import * as ROT from 'rot-js';
import { put, select } from 'redux-saga/effects';
import { CELL_PROPERTIES } from '../cells';
import { TRIGGER_TYPES } from '../zones';
import { ENTITY_TYPES } from '../entities';
import { cellKey } from '../utils/map';
import { isConditionTrue } from '../utils/conditions';
import { isWithinZone } from '../zones';

import { GameState, Trigger, Action, ConditionalAction } from '../types';
export function* moveEntity(action): Generator {
  const state = yield select();
  const { dx, dy, id, skipZones } = action.payload;
  const { map, entities } = (state as GameState);
  const entity = entities[id];
  const { x, y } = entity;
  const currentKey = cellKey(x, y);
  const nextKey = cellKey(x + dx, y + dy);
  const currentCell = map[currentKey];
  const nextCell = map[nextKey];

  if (!CELL_PROPERTIES[nextCell.type].solid) {
    yield put({
      type: 'ENTITY_MOVED',
      payload: {
        id,
        src: currentCell,
        dest: nextCell,
        skipZones: !!skipZones
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
  if (id) {
    yield put({
      type: 'MOVE_ENTITY',
      payload: {
        dx, dy, id
      }
    });
  }
}

export function* entityMoved(action): Generator {
  const state = yield select();
  const { zones, entities } = (state as GameState);
  const { id, src, dest, skipZones } = action.payload;
  const dx = dest.x - src.x;
  const dy = dest.y - src.y;
  const entity = entities[id];
  const checkCurrentCellInZone = isWithinZone(src.x, src.y);
  const checkNextCellInZone = isWithinZone(dest.x, dest.y);
  const conditionChecker = isConditionTrue(entities[id], src, dest);
  const triggers = Object.values(skipZones ? [] : zones).reduce((acc, zone) => {
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

  let preventMove = false;
  for (const trigger of triggers.enter) {
    for (const action of (trigger as Trigger).actions) {
      const { conditions } = (action as ConditionalAction);
      if (
        !conditions ||
        conditions.length === 0 ||
        conditions.reduce(
          (isTrue, condition) => isTrue && conditionChecker(condition),
          true
        )
      ) {
        if (trigger.flags && trigger.flags.includes('PREVENT_DEFAULT_MOVE')) {
          preventMove = true;
        }
        yield put((action as Action));
      }
    }
  }
  for (const trigger of triggers.exit) {
    for (const action of (trigger as Trigger).actions) {
      const { conditions } = (action as ConditionalAction);
      if (
        !conditions ||
        conditions.length === 0 ||
        conditions.reduce(
          (isTrue, condition) => isTrue && conditionChecker(condition),
          true
        )
      ) {
        if (trigger.flags && trigger.flags.includes('PREVENT_DEFAULT_MOVE')) {
          preventMove = true;
        }
        yield put((action as Action));
      }
    }
  }
  for (const trigger of triggers.within) {
    for (const action of (trigger as Trigger).actions) {
      const { conditions } = (action as ConditionalAction);
      if (
        !conditions ||
        conditions.length === 0 ||
        conditions.reduce(
          (isTrue, condition) => isTrue && conditionChecker(condition),
          true
        )
      ) {
        if (trigger.flags && trigger.flags.includes('PREVENT_DEFAULT_MOVE')) {
          preventMove = true;
        }
        yield put((action as Action));
      }
    }
  }

  if (!preventMove) {
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

export function* movementFailed(action): Generator {
  const { id, src, dest } = action.payload;
  const state = yield select();
  const { entities } = (state as GameState);
  if (entities[id].type === ENTITY_TYPES.PLAYER) {
    yield put({ type: 'LOG_MESSAGE', payload: { message: 'Alas! You cannot go that way.' }});
  }
}

export function* randomWalk(): Generator {
  const state = yield select();
  const { entities, map } = (state as GameState);
  const id = Object.keys(entities).filter(id => entities[id].type === ENTITY_TYPES.PLAYER)[0];
  let dx = 0;
  let dy = 0;
  dy = ROT.RNG.getItem([-1, 0, 0, 1]);
  if (dy === 0) {
    dx = ROT.RNG.getItem([-1, 0, 0, 1]);
  }
  const nextCell = map[cellKey(entities[id].x + dx, entities[id].y + dy)];

  if (!CELL_PROPERTIES[nextCell.type].solid) {
    yield put({
      type: 'MOVE_ENTITY',
      payload: {
        dx, dy, id, skipZones: true
      }
    });
  }
}