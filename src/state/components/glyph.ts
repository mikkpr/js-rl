import { BaseComponent } from 'ecs-machina';

export interface Glyph extends BaseComponent {
  glyph: string;
  fg: string;
  bg: string;
  z: number;
}

export const Glyph = 'Glyph';

export const isGlyph = (cmp: BaseComponent): cmp is Glyph => {
  return cmp._type === Glyph;
}
