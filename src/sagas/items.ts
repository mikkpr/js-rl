import { put, select } from 'redux-saga/effects';
import { cellKey } from '../utils/map';

import { GameState } from '../types';
import { ENTITY_TYPES } from '../entities';

export function* pickUpItem(action): Generator {
  const { x, y, itemID, entityID } = action.payload;
  const state = yield select();
  const { entities, map } = (state as GameState);

  const key = cellKey(x, y);
  const cell = map[key];
  if (!cell) { return; }

  const entity = entities[entityID];
  if (!entity) { return; }

  // if entity is in cell and cell has the item
  if (cell.contents.includes(itemID) && entity.x === x && entity.y === y) {
    yield put({ type: 'REMOVE_ITEM_FROM_CELL', payload: { x, y, itemID } });
    yield put({ type: 'ADD_ITEM_TO_ENTITY', payload: { itemID, entityID } });
  }
}

export function* pickUpTopmostItem(action): Generator {
  const state = yield select();
  const { entities, map, items } = (state as GameState);

  const entityID = Object.keys(entities).filter(id => entities[id].type === ENTITY_TYPES.PLAYER)[0];
  const { x, y } = entities[entityID];

  const key = cellKey(x, y);
  const cell = map[key];
  if (!cell) { return; }

  const entity = entities[entityID];
  if (!entity) { return; }

  const itemID = cell.contents && cell.contents.length > 0 ? cell.contents[cell.contents.length - 1] : undefined;

  if (!itemID) {
    yield put({ 
      type: 'LOG_MESSAGE', payload: { message: 'There is nothing to pick up here.' }
    });
    return;
  }

  // if entity is in cell and cell has the item
  if (itemID && cell.contents.includes(itemID) && entity.x === x && entity.y === y) {
    yield pickUpItem({
      type: 'PICK_UP_ITEM',
      payload: {
        x, y, itemID, entityID
      }
    });
    const name = items[itemID].name;
    yield put({ type: 'LOG_MESSAGE', payload: { message: `You pick up ${name}.` } })
  }
}

export function* dropItem(action): Generator {
  const { entityID, itemID } = action.payload;
  const state = yield select();
  const { entities, map, items } = (state as GameState);

  const entity = entities[entityID];
  if (!entity) { return; }

  const { x, y } = entity;
  const key = cellKey(x, y);
  const cell = map[key]; 

  if (!cell) { return; }

  // if entity has the item
  if (entity.inventory.includes(itemID)) {
    const name = items[itemID].name;
    yield put({ type: 'ADD_ITEM_TO_CELL', payload: { x, y, itemID }});
    yield put({ type: 'REMOVE_ITEM_FROM_ENTITY', payload: { itemID, entityID }});
    yield put({ type: 'LOG_MESSAGE', payload: { message: `You drop ${name}.` } })
  }
}

export function* dropPlayerItem(action): Generator {
  const { idx } = action.payload;
  const state = yield select();
  const { entities, map } = (state as GameState);

  const entityID = Object.keys(entities).filter(id => entities[id].type === ENTITY_TYPES.PLAYER)[0];
  const { x, y } = entities[entityID];
  if (!entityID) { return; }

  const key = cellKey(x, y);
  const cell = map[key];
  if (!cell) { return; }

  const inventory = entities[entityID].inventory;
  if (inventory.length === 0) { return; }
  const itemID = entities[entityID].inventory[idx];
  if (!itemID) { return; }

  yield dropItem({
    type: 'DROP_ITEM',
    payload: { entityID, itemID }
  });

  yield put({
    type: 'CLOSE_UI',
    payload: {}
  });
}
