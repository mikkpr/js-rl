import { Engine } from 'geotic';
import * as Components from './components';
import { Base, Complex } from './prefabs';

const {
  Appearance,
  Position,
  Move,
  IsBlocking,
  Layer400,
  Description,
  Ai,
} = Components;

export const engine = new Engine();
for (let c of Object.keys(Components)) {
  engine.registerComponent(Components[c]);
}

for (let b of Base) {
  engine.registerPrefab(b);
}

for (let c of Complex) {
  engine.registerPrefab(c);
}

const world = engine.createWorld();

export default world;

