export interface Glyph {
  glyph: string;
  fg: string;
  bg: string;
}

export type Entities = {
  [id: string]: Entity
}

export type Entity = Glyph & {
  x: number;
  y: number;
  type: string;
}
