import { ID } from './utils/id';
import { Item } from './types';

export const createItem = ({
  name,
  glyph,
  flags = []
}: {
  name: string;
  glyph: string;
  flags?: string[];
}): Item => {
  return {
    name,
    glyph,
    flags,
    id: ID(),
  };
};
