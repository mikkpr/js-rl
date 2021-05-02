import { Engine } from 'geotic';
import * as Components from './components';

const {
  Appearance,
  Position,
  Move,
  IsBlocking,
  Layer400,
} = Components;

export const engine = new Engine();
for (let c of Object.keys(Components)) {
  engine.registerComponent(Components[c]);
}


const world = engine.createWorld();

export const player = world.createEntity();
player.add(Appearance, { char: '@', color: '#fff' });
player.add(Layer400);

export default world;

