import { Item } from './types';
import { GLYPHS } from './glyphs';
import { ID } from './utils/id';
import { action } from './state';

export const setupItems = ({ game }) => {
  const item: Item = {
    glyph: GLYPHS.KEY,
    id: ID(),
    name: 'a key'
  };

  game.dispatch({ type: 'ADD_ITEM', payload: { item } });
};