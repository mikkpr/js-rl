import * as ROT from 'rot-js';
import { Entity, System } from 'ecsy';
import { Position, Renderable, Viewshed, Light } from '../components';
import { display } from '../..';
import { drawMap, addLight } from '../../display';
import { xyIdx } from '../../map';
import { game } from '../..';

const byZIndex = (a: Entity, b: Entity): number => b.getComponent(Renderable).z - a.getComponent(Renderable).z;

class RenderingSystem extends System {
  display: ROT.Display;

  execute(delta: number, time: number): void {
    drawMap(game.getState().map);

    const viewshed = game.player.getComponent(Viewshed);

    this.queries.renderables.results.sort(byZIndex).forEach(entity => {
      const position = entity.getComponent(Position);
      const renderable = entity.getComponent(Renderable);
      const idx = xyIdx(position.x, position.y);
      if (viewshed.visibleTiles && viewshed.visibleTiles.has(idx)) {
        const lights = this.queries.lights.results.map(r => r.getComponent(Light));
        const fg = ROT.Color.fromString(renderable.fg) as Color;
        const fgWithLights = addLight(lights, idx, fg);
        display.draw(
          position.x + game.cameraOffset[0],
          position.y + game.cameraOffset[1],
          renderable.glyph,
          ROT.Color.toHex(fgWithLights),
          renderable.bg
        );
      }
    });
  }
}

RenderingSystem.queries = {
  renderables: { components: [ Position, Renderable ]},
  lights: { components: [Light] }
};

export default RenderingSystem;
