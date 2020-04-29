import { Glyph } from '.';

export type Item = {
  glyph: Glyph;
  id: string;
  name: string;
}

export type Items = {
  [id: string]: Item;
}