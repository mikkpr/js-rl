import * as ROT from 'rot-js';
import { System } from 'ecsy';
import { Position, Renderable, Viewshed } from '../components';
import { display } from '../..';
import { drawMap } from '../../display';
import { xyIdx } from '../../map';
import { game } from '../..';

class RenderingSystem extends System {
  display: ROT.Display;

  execute(delta: number, time: number): void {
    const player = game.player;
    const viewshed = player.getMutableComponent(Viewshed);

    drawMap(game.getState().map, viewshed);
    this.queries.renderables.results.forEach(entity => {
      const position = entity.getComponent(Position);
      const renderable = entity.getComponent(Renderable);
      if (viewshed.visibleTiles.includes(xyIdx(position.x, position.y))) {
        display.draw(
          position.x,
          position.y,
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
