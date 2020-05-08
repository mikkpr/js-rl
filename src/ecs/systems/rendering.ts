import * as ROT from 'rot-js';
import { System } from 'ecsy';
import { Position, Renderable, Viewshed, Light } from '../components';
import { display } from '../..';
import { drawMap } from '../../display';
import { xyIdx } from '../../map';
import { game } from '../..';

class RenderingSystem extends System {
  display: ROT.Display;

  execute(delta: number, time: number): void {
    const player = game.player;
    const viewshed = player.getComponent(Viewshed);
    const light = player.getComponent(Light);

    drawMap(game.getState().map, viewshed, light);

    this.queries.renderables.results.forEach(entity => {
      const position = entity.getComponent(Position);
      const renderable = entity.getComponent(Renderable);
      if (viewshed.visibleTiles && viewshed.visibleTiles.includes(xyIdx(position.x, position.y))) {
        display.draw(
          position.x + game.cameraOffset[0],
          position.y + game.cameraOffset[1],
          renderable.glyph,
          renderable.fg,
          renderable.bg
        );
      }
    });
  }
}

RenderingSystem.queries = {
  renderables: { components: [ Position, Renderable ]}
};

export default RenderingSystem;
