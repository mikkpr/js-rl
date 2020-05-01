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

  yield put({
    type: 'ENTITY_MOVED',
    payload: {
      id,
      src: currentCell,
      dest: nextCell,
      skipZones: !!skipZones
    }
  });
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

const matchTriggerType = (type, currentInZone, nextInZone) => {
  if (type === TRIGGER_TYPES.ENTER) {
    return !currentInZone && nextInZone;
  } else if (type === TRIGGER_TYPES.EXIT) {
    return currentInZone && !nextInZone;
  } else if (type === TRIGGER_TYPES.WITHIN) {
    return currentInZone && nextInZone;
  }

  return false;
};

export function* afterPlayerMove(nextCell): Generator {
  const state = yield select();
  const { items } = (state as GameState);
  if (nextCell.contents.length > 0) {
    const topItem = items[nextCell.contents[nextCell.contents.length - 1]];
    yield put({
      type: 'LOG_MESSAGE',
      payload: { message: `There is ${topItem.name} here.` }
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
  const conditionChecker = isConditionTrue(entities[id], src, dest, dx, dy);
  let preventMove = false;

  if (!CELL_PROPERTIES[dest.type].flags.includes('SOLID')) {
    for (const zone of Object.values(skipZones ? [] : zones)) {
      const currentInZone = checkCurrentCellInZone(zone);
      const nextInZone = checkNextCellInZone(zone);

      for (const trigger of zone.triggers) {
        for (const action of (trigger as Trigger).actions) {
          const { conditions } = (action as ConditionalAction);
          if (!matchTriggerType(trigger.type, currentInZone, nextInZone)) { break; }
          const noConditions = !conditions || conditions.length === 0;
          const conditionsMatch = !noConditions && conditions.reduce(
            (isTrue, condition) => isTrue && conditionChecker(condition),
            true
          );

          if (noConditions || conditionsMatch) {
            if (trigger.flags && trigger.flags.includes('PREVENT_DEFAULT_MOVE')) {
              preventMove = true;
            }
            yield put((action as Action));
          }

          if (!noConditions && !conditionsMatch){
            if (trigger.flags && trigger.flags.includes('BREAK_ON_MISMATCH')) {
              break;
            }
          }
        }
      }
    }
  }

  if (!preventMove) {
    if (!CELL_PROPERTIES[dest.type].flags.includes('SOLID')) {
      yield put({
        type: 'UPDATE_ENTITY_POSITION',
        payload: {
          x: dx,
          y: dy,
          relative: true,
          id
        }
      });

      if (entity.type === ENTITY_TYPES.PLAYER) {
        yield put({
          type: 'UPDATE_CAMERA_POSITION',
          payload: {
            x: -dx,
            y: -dy,
            relative: true
          }
        });
        yield afterPlayerMove(dest);
      }
    } else {
      yield put({
        type: 'MOVEMENT_FAILED',
        payload: {
          src,
          dest,
          id
        }
      });
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

  if (!CELL_PROPERTIES[nextCell.type].flags.includes('SOLID')) {
    yield put({
      type: 'MOVE_ENTITY',
      payload: {
        dx, dy, id, skipZones: true
      }
    });
  }
}
