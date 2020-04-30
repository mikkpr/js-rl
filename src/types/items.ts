import { Glyph } from '.';

export type ItemID = string;
export type Item = {
  glyph: string;
  id: string;
  name: string;
}

export type Items = {
  [id: string]: Item;
}
