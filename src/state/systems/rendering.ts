import { BaseComponent, System } from 'ecs-machina';
import { isViewshed } from '../components';
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
    state.display.clear();
    const { visibleCells } = state.world.getComponents(state.getState().player).find(isViewshed);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const idx = state.map.getIdx(x, y);
        if (visibleCells.has(idx)) {
          state.display.draw(x, y, state.map.getCellGlyph(x, y), state.map.getCellColor(x, y), 'black');
        }
      }
    }

  }

  public drawEntity(entity: string, components: BaseComponent[], { display }): void {
    const { visibleCells } = state.world.getComponents(state.getState().player).find(isViewshed);
    const position = components.find(isPosition);
    const glyph = components.find(isGlyph);
    if (visibleCells.has(state.map.getIdx(position.x, position.y))) {
      display.draw(position.x, position.y, glyph.glyph, glyph.fg, glyph.bg);
    }
  }
}
