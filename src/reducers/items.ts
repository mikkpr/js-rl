import produce from 'immer';
import { Items, GameState, Action } from '../types';

export const itemsState: { items: Items } = {
  items: {}
};

const addItem = (state: GameState, action: Action): GameState => {
  const { item } = action.payload;
  return produce(state, state => {
    state.items[item.id] = item;
  });
};

const addItemToEntity = (state: GameState, action: Action): GameState => {
  return state;
};

const addItemToCell = (state: GameState, action: Action): GameState => {
  return state;
};

const removeItemFromEntity = (state: GameState, action: Action): GameState => {
  return state;
};

const removeItemFromCell = (state: GameState, action: Action): GameState => {
  return state;
};

const itemActions = {
  'ADD_ITEM': addItem,
  'ADD_ITEM_TO_CELL': addItemToCell,
  'ADD_ITEM_TO_ENTITY': addItemToEntity,
  'REMOVE_ITEM_TO_CELL': removeItemFromCell,
  'REMOVE_ITEM_TO_ENTITY': removeItemFromEntity
};

export default itemActions;