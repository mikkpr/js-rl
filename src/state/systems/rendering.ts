import { BaseComponent, System } from 'ecs-machina';
import state from '..';

import {
  Glyph,
  isGlyph, 
  Position,
  isPosition 
} from '../components';

export class RenderingSystem extends System { 
  public requiredComponents = [Glyph, Position];

  public beforeDraw() {
    const { width, height } = state.map;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        state.display.draw(x, y, state.map.getCellGlyph(x, y), state.map.getCellColor(x, y), 'black');
      }
    }

  }

  public drawEntity(entity: string, components: BaseComponent[], { display }): void {
    const position = components.find(isPosition);
    const glyph = components.find(isGlyph);
    display.draw(position.x, position.y, glyph.glyph, glyph.fg, glyph.bg);
  }
}
