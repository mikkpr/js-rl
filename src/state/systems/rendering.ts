import { BaseComponent, System } from 'ecs-machina';
import state from '..';
import { WIDTH, HEIGHT } from '../../constants';
import { drawGUI } from '../../gui';

import {
  Glyph,
  isGlyph, 
  Position,
  isPosition,
  isViewshed,
} from '../components';

export class RenderingSystem extends System { 
  public requiredComponents = [Glyph, Position];

  public beforeDraw() {
    const { map, camera } = state;
    const { width, height } = map;
    state.display.clear();
    const [cameraX, cameraY] = camera;
    const cameraBounds = [
      ~~(cameraX - WIDTH/2),
      ~~(cameraY - HEIGHT/2),
      ~~(cameraX + WIDTH/2),
      ~~(cameraY + HEIGHT/2)
    ];
    const { visibleCells, exploredCells } = state.world.getComponents(state.getState().player).find(isViewshed);
    for (let x = cameraBounds[0]; x < cameraBounds[2]; x++) {
      for (let y = cameraBounds[1]; y < cameraBounds[3]; y++) {
        const idx = state.map.getIdx(x, y);
        if (idx != null && visibleCells.has(idx)) {
          state.display.draw(x - cameraBounds[0], y - cameraBounds[1], state.map.getCellGlyph(x, y), state.map.getCellColor(x, y), 'black');
        } else if (idx != null && exploredCells.has(idx)) {
          state.display.draw(x - cameraBounds[0], y - cameraBounds[1], state.map.getCellGlyph(x, y), '#111', 'black');
        }
      }
    }
    drawGUI();
  }

  public drawEntity(entity: string, components: BaseComponent[], { display }): void {
    const position = components.find(isPosition);
    const { x, y } = position;
    if (x < 0 || x >= state.map.width || y < 0 || y >= state.map.height) { return; }
    const { camera } = state;
    const [cameraX, cameraY] = camera;
    const cameraBounds = [
      ~~(cameraX - WIDTH/2),
      ~~(cameraY - HEIGHT/2),
      ~~(cameraX + WIDTH/2),
      ~~(cameraY + HEIGHT/2)
    ];
 
    const { visibleCells } = state.world.getComponents(state.getState().player).find(isViewshed);
    const glyph = components.find(isGlyph);
    const idx = state.map.getIdx(position.x, position.y);
    if (idx != null && visibleCells.has(idx)) {
      display.draw(position.x - cameraBounds[0], position.y - cameraBounds[1], glyph.glyph, glyph.fg, glyph.bg);
    }
  }
}
