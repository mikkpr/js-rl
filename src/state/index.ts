import { World, BaseComponent } from 'ecs-machina';
import produce from 'immer';
import { match } from 'egna';
import { Display } from 'rot-js';
import { CellType, WorldMap } from '../map';
import { 
  createDamageTrigger,
  createExitTrigger,
  createWeightTrigger,
  createItem,
  createPlayer,
  createKobold,
  createKey
} from './spawner';
import { Key } from './components';
import { MAPWIDTH, MAPHEIGHT } from '../constants';
import {
  CameraSystem,
  VisibilitySystem,
  IntentSystem,
  RenderingSystem,
  AISystem,
  TriggerSystem,
} from './systems';
import { RunState } from './fsm';

type State = {
  [key: string]: any
}

export type MyWorld = World & {
  rng?: () => number;
  getComponentMap?: (entity: string) => Map<string, BaseComponent>
};

const initialState = {
  runState: RunState.PRERUN,
  inventoryVisible: false,
  log: [
    "You wake up in a dank cell.",
  ]
}

class GameState {
  world: MyWorld;
  state: State;
  map: WorldMap;
  display: Display;
  camera: [number, number];

  constructor(state = initialState) {
    this.world = new World();
    this.world.getComponentMap = (entity: string) => {
      const cmp = this.world.getComponents(entity);
      const map = new Map<string, BaseComponent>();
      cmp.forEach(c => map.set(c._type, c));

      return map;
    }
    this.world.rng = Math.random;
    this.state = state;
    this.map = new WorldMap(MAPWIDTH, MAPHEIGHT);
    this.camera = [0, 0];

    this.world.registerSystem(new AISystem());
    this.world.registerSystem(new IntentSystem());
    this.world.registerSystem(new TriggerSystem());
    this.world.registerSystem(new CameraSystem());
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

  shiftCamera = (dx: number, dy: number) => {
    this.camera[0] += dx;
    this.camera[1] += dy;
  }

  setCamera = (x: number, y: number) => {
    this.camera = [x, y];
  }

  log = (message: string) => {
    this.setState(state => {
      state.log = state.log.concat(message);
    });
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

export const setupEntities = (): {
  player: string;
  kobold: string;
  key: string;
  stash: string;
} => {
  const player = createPlayer({x: 4, y: 8});

  const kobold = createKobold({x: 8, y: 4});

  const key = createKey({ owner: kobold, doorIdx: 74 });

  const stash = createItem({
    x: 9, y: 8,
    glyph: '$',
    fg: '#ff0',
    bg: 'black',
    weight: 2,
    name: 'stash of coins'
  });
  state.world.registerComponent(stash, {
    _type: Key,
    doorIdx: 14,
  } as Key)

  const trigger = createWeightTrigger({
    x: 5,
    y: 4,
    weight: 5,
    idx: 27,
    newType: CellType.FLOOR,
    oldType: CellType.WALL,
    triggered: false,
    messages: {
      trigger: 'You hear something heavy sliding aside.',
      revert: 'You hear something sliding back into place.'
    }
  });

  const boulder = createItem({
    x: 6, y: 1,
    glyph: '○',
    fg: '#666',
    bg: 'black',
    weight: 3,
    name: 'boulder'
  });

  const exitTrigger = createExitTrigger({
    x: 5,
    y: 2,
    message: 'You have found a secret passage!'
  });

  const exitTrigger2 = createExitTrigger({
    x: 3,
    y: 1,
    message: 'You take your treasures and leave.'
  });

  const fire = createDamageTrigger({
    x: 1,
    y: 3,
    damage: 1,
    message: 'The fire burns you!'
  });

  return {
    player,
    kobold,
    key,
    stash,
  };
}
