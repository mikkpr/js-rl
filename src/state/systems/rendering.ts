import { BaseComponent, System } from 'ecs-machina';
import state from '..';
import { WIDTH, HEIGHT } from '../../constants';
import { drawGUI } from '../../gui';

import {
  Glyph,
  isGlyph, 
  Position,
  isPosition,
  Viewshed,
} from '../components';

export class RenderingSystem extends System { 
  public requiredComponents = [Glyph, Position];

  public beforeDraw() {
  }

  public draw({ layer }) {
    if (layer === 'map') {
      state.display.clear();
      this.drawMap();
    } else if (layer === 'entities') {
      Array.from(state.world.entities).sort((a, b) => a[1].find(isGlyph).z - b[1].find(isGlyph).z).forEach(([entity, components]) => {
        this.drawEntity(entity, components);
      })
    } else if (layer === 'gui') {
      drawGUI();
    }
  }

  public drawMap() {
    const { map, camera } = state;
    const { width, height } = map;
    const [cameraX, cameraY] = camera;
    const cameraBounds = [
      ~~(cameraX - WIDTH/2),
      ~~(cameraY - HEIGHT/2),
      ~~(cameraX + WIDTH/2),
      ~~(cameraY + HEIGHT/2)
    ];
    const viewshed = state.world.getComponentMap(state.getState().player).get(Viewshed) as Viewshed;
    const { visibleCells, exploredCells } = viewshed || {}; 
    for (let x = cameraBounds[0]; x < cameraBounds[2]; x++) {
      for (let y = cameraBounds[1]; y < cameraBounds[3]; y++) {
        const idx = state.map.getIdx(x, y);
        if (idx != null && (!visibleCells || visibleCells.has(idx))) {
          state.display.draw(x - cameraBounds[0], y - cameraBounds[1], state.map.getCellGlyph(x, y), state.map.getCellColor(x, y), 'black');
        } else if (idx != null && exploredCells.has(idx)) {
          state.display.draw(x - cameraBounds[0], y - cameraBounds[1], state.map.getCellGlyph(x, y), '#111', 'black');
        }
      }
    }
  }

  public drawEntity(entity: string, components: BaseComponent[]): void {
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
    const viewshed = state.world.getComponentMap(state.getState().player).get(Viewshed) as Viewshed;
    const { visibleCells } = viewshed || {};
    const glyph = components.find(isGlyph);
    const idx = state.map.getIdx(position.x, position.y);
    if (idx != null && (!visibleCells || visibleCells.has(idx))) {
      state.display.draw(position.x - cameraBounds[0], position.y - cameraBounds[1], glyph.glyph, glyph.fg, glyph.bg);
    }
  }
}
