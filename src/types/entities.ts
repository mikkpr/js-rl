import { ItemID } from '.';

export type Glyph = {
  glyph: string;
  fg: string;
  bg: string;
}

export type Entities = {
  [id: string]: Entity;
}

export type Entity = {
  x: number;
  y: number;
  type: string;
  glyph: string;
  inventory: ItemID[];
  id?: string;
}

export type Color = [number, number, number];
