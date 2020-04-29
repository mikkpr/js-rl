import * as ROT from 'rot-js';
import { Item, Cell } from './types';
import { GLYPHS } from './glyphs';
import { CELL_TYPES } from './cells';
import { ID } from './utils/id';
import { action } from './state';

export const setupItems = ({ game }) => {
  const item: Item = {
    glyph: GLYPHS.KEY,
    id: ID(),
    name: 'a key'
  };

  game.dispatch({ type: 'ADD_ITEM', payload: { item } });

  const cell: Cell = ROT.RNG.getItem<Cell>(Object.values<Cell>(game.getState().map).filter(c => (c as Cell).type === CELL_TYPES.FLOOR));

  game.dispatch({ type: 'UPDATE_CELL', payload: { cell: { ...cell, contents: cell.contents.concat(item.id) } } });
};
