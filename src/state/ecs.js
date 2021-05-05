import { Engine } from 'geotic';
import * as Components from './components';
import { Base, Complex } from './prefabs';

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

export const messageLog = ["", "Welcome to Gobs 'O Goblins!", ""];
export const addLog = text => {
  messageLog.unshift(text);
};

const world = engine.createWorld();

export default world;

