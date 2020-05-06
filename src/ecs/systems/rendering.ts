import * as ROT from 'rot-js';
import { System } from 'ecsy';
import { Position, Renderable } from '../components';

class RenderingSystem extends System {
  display: ROT.Display;

  execute(delta: number, time: number): void {
    console.log(this.attributes);
    this.queries.renderables.results.forEach(entity => {
      const position = entity.getComponent(Position);
      const renderable = entity.getComponent(Renderable);

      this.display.draw(
        position.x,
        position.y,
        renderable.glyph,
        renderable.fg,
        renderable.bg
      );
    })
  }
};

RenderingSystem.queries = {
  renderables: { components: [ Position, Renderable ]}
};

export default RenderingSystem;