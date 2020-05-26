import { World } from 'ecs-machina';
import produce from 'immer';
import Alea from 'alea';
import { ID } from '../utils/id';

import { Player, Position, Glyph, AI } from './components';
import { MovementSystem, RenderingSystem, AISystem } from './systems';

type State = {
  [key: string]: any
}

export type WorldWithRNG = World & { rng?: () => number };

class GameState {
  world: WorldWithRNG;
  state: State;

  constructor(initialState = {}) {
    this.world = new World();
    this.world.rng = Math.random;
    this.state = initialState;

    this.world.registerSystem(new MovementSystem());
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

const createPlayer = ({x, y}) => {
  const player = state.world.createEntity();
  state.world.registerComponent(player, {
    _type: Player
  });
  state.world.registerComponent(player, {
    x: x,
    y: y,
    _type: Position
  } as Position);
  state.world.registerComponent(player, {
    glyph: '@',
    fg: '#fa0',
    bg: '#000',
    _type: Glyph
  } as Glyph);

  return player;
}

const createKobold = ({x, y}) => {
  const kobold = state.world.createEntity();
  state.world.registerComponent(kobold, {
    x: 10,
    y: 10,
    _type: Position
  } as Position);
  state.world.registerComponent(kobold, {
    glyph: 'k',
    fg: '#666',
    bg: '#000',
    _type: Glyph
  } as Glyph);
  state.world.registerComponent(kobold, {
    _type: AI,
    ai: ['AVOID_PLAYER', 'RANDOM_WALK']
  } as AI);

  return kobold;
}
