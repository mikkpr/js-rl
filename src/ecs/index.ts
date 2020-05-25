import { World } from 'ecs-machina';
import produce from 'immer';
import Alea from 'alea';
import { ID } from '../utils/id';

import { Position, Glyph, AI } from './components';
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
}): { player: string; } => {
  const player = state.world.createEntity();
  state.world.registerComponent(player, {
    x: playerX || 1,
    y: playerY || 1,
    _type: Position
  } as Position);
  state.world.registerComponent(player, {
    glyph: '@',
    fg: '#fa0',
    bg: '#000',
    _type: Glyph
  } as Glyph);
  state.world.registerSystem(new MovementSystem());
  state.world.registerSystem(new AISystem());
  state.world.registerSystem(new RenderingSystem());

  const randomMover = state.world.createEntity();
  state.world.registerComponent(randomMover, {
    x: 10,
    y: 10,
    _type: Position
  } as Position);
  state.world.registerComponent(randomMover, {
    glyph: 'k',
    fg: '#666',
    bg: '#000',
    _type: Glyph
  } as Glyph);
  state.world.registerComponent(randomMover, {
    _type: AI,
    ai: 'RANDOM_WALK'
  } as AI);

  return {
    player
  };
}
