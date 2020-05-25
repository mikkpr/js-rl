import { BaseComponent, System } from 'ecs-machina';

import {
  Glyph,
  isGlyph, 
  Position,
  isPosition 
} from '../components';

export class RenderingSystem extends System { 
  public requiredComponents = [Glyph, Position];

  public drawEntity(entity: string, components: BaseComponent[], { display }): void {
    const position = components.find(isPosition);
    const glyph = components.find(isGlyph);
    display.draw(position.x, position.y, glyph.glyph, glyph.fg, glyph.bg);
  }
}
