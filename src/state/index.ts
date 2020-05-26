import { World } from 'ecs-machina';
import produce from 'immer';
import { Display } from 'rot-js';
import { Map } from '../map';
import { createPlayer, createKobold } from './spawner';
import { MAPWIDTH, MAPHEIGHT } from '../constants';
import { IntentSystem, RenderingSystem, AISystem } from './systems';

type State = {
  [key: string]: any
}

export type WorldWithRNG = World & { rng?: () => number };

class GameState {
  world: WorldWithRNG;
  state: State;
  map: Map;
  display: Display;

  constructor(initialState = {}) {
    this.world = new World();
    this.world.rng = Math.random;
    this.state = initialState;
    this.map = new Map(MAPWIDTH, MAPHEIGHT);

    this.world.registerSystem(new IntentSystem());
    this.world.registerSystem(new AISystem());
    this.world.registerSystem(new RenderingSystem());
  }

  setState = (setter: (state: State) => void): State => {
    this.state = produce(this.state, setter);

    return this.state;
  }

  getState = (getter?: (state: State) => State): State => {
    if (!getter) { return this.state; }
    return getter(this.state);
  }

  update = () => {
    this.world.update();
  }
}

const state = new GameState;

export default state;

export const setupEntities = ({
  playerX,
  playerY
}: {
  playerX: number;
  playerY: number;
}): {
  player: string;
  kobold: string;
} => {
  const player = createPlayer({x: playerX, y: playerY});
  const kobold = createKobold({x: 10, y: 10});

  return {
    player,
    kobold
  };
}
