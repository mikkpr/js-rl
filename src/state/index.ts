import { World } from 'ecs-machina';
import produce from 'immer';
import { match } from 'egna';
import { Display } from 'rot-js';
import { WorldMap } from '../map';
import { createPlayer, createKobold } from './spawner';
import { MAPWIDTH, MAPHEIGHT } from '../constants';
import { VisibilitySystem, IntentSystem, RenderingSystem, AISystem } from './systems';
import { RunState } from './fsm';

type State = {
  [key: string]: any
}

export type WorldWithRNG = World & { rng?: () => number };

class GameState {
  world: WorldWithRNG;
  state: State;
  map: WorldMap;
  display: Display;

  constructor(initialState = { runState: RunState.PRERUN }) {
    this.world = new World();
    this.world.rng = Math.random;
    this.state = initialState;
    this.map = new WorldMap(MAPWIDTH, MAPHEIGHT);

    this.world.registerSystem(new AISystem());
    this.world.registerSystem(new IntentSystem());
    this.world.registerSystem(new VisibilitySystem());
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
    const runState = this.getState().runState;
    match(
      RunState.PRERUN, () => {
        this.world.update();
        this.setState(state => { state.runState = RunState.WAITING_INPUT; });
      },
      RunState.WAITING_INPUT, () => {
      },
      RunState.PLAYER_TURN, () => {
        this.setState(state => { state.runState = RunState.WORLD_TURN; });
      },
      RunState.WORLD_TURN, () => {
        this.world.update();
        this.setState(state => { state.runState = RunState.WAITING_INPUT; });
      },
      () => {}
    )(runState);
  }
}

const state = new GameState;
eval('window.RL = state;');

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
  state.map.setEntityLocation(player, state.map.getIdx(playerX, playerY));

  const kobold = createKobold({x: 10, y: 10});
  state.map.setEntityLocation(kobold, state.map.getIdx(10, 10));

  return {
    player,
    kobold
  };
}
