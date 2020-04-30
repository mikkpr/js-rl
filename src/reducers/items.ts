import produce from 'immer';
import { cellKey } from '../utils/map';
import { Items, GameState, Action } from '../types';

export const itemsState: { items: Items } = {
  items: {}
};

const createItem = (state: GameState, action: Action): GameState => {
  const { item } = action.payload;
  return produce(state, state => {
    state.items[item.id] = item;
  });
};

const addItemToEntity = (state: GameState, action: Action): GameState => {
  const { entityID, itemID } = action.payload;
  return produce(state, state => {
    state.entities[entityID].inventory.push(itemID);
  });
};

const addItemToCell = (state: GameState, action: Action): GameState => {
  const { x, y, itemID } = action.payload;
  const key = cellKey(x, y);
  return produce(state, state => {
    state.map[key].contents.push(itemID);
  });
};

const removeItemFromEntity = (state: GameState, action: Action): GameState => {
  const { itemID, entityID } = action.payload;
  return produce(state, state => {
    state.entities[entityID].inventory = state.entities[entityID].inventory.filter(id => id !== itemID);
  });
};

const removeItemFromCell = (state: GameState, action: Action): GameState => {
  const { x, y, itemID } = action.payload;
  const key = cellKey(x, y);
  return produce(state, state => {
    state.map[key].contents = state.map[key].contents.filter(id => id !== itemID);
  });
};

const itemActions = {
  'CREATE_ITEM': createItem,
  'ADD_ITEM_TO_CELL': addItemToCell,
  'ADD_ITEM_TO_ENTITY': addItemToEntity,
  'REMOVE_ITEM_FROM_CELL': removeItemFromCell,
  'REMOVE_ITEM_FROM_ENTITY': removeItemFromEntity
};

export default itemActions;
