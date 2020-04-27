import produce from 'immer';
import { GameState, Action } from '../types';
import { cellKey } from '../utils/map';

export const mapState = {
  map: {}
};

const updateCell = (state: GameState, action: Action): GameState => {
  const { cell } = action.payload;
  const { x, y } = cell;
  const key = cellKey(x, y);
  return produce(state, state => {
    state.map[key] = cell;
  });
};

const updateCells = (state: GameState, action: Action): GameState => {
  const { cells } = action.payload;
  return cells.reduce((state, cell) => updateCell(state, { type: 'UPDATE_CELL', payload: { cell }}), state);
};

const actionMap = {
  'UPDATE_CELL': updateCell,
  'UPDATE_CELLS': updateCells
};

export default actionMap;