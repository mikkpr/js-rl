import produce from 'immer';
import * as ROT from 'rot-js';
import { World } from 'ecsy';
import throttle from 'lodash/throttle';
import { WIDTH, HEIGHT } from '.';
import { CellType } from './map';
import { drawMap, drawGUI } from './display';
import { RenderingSystem } from './ecs/systems';

const ENABLE_LOGGING = false;

export enum RunState {
  PRERUN = 'PRERUN',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  AWAITINGINPUT = 'AWAITINGINPUT',
  PLAYERTURN = 'PLAYERTURN',
  MONSTERTURN = 'MONSTERTURN',
  SHOWINVENTORY = 'SHOWINVENTORY',
  SHOWDROPITEM = 'SHOWDROPITEM',
  SHOWTARGETING = 'SHOWTARGETING',
  MAINMENU = 'MAINMENU',
  SAVEGAME = 'SAVEGAME'
}

export type State = {
  runState: RunState;
  map: CellType[];
}

type StateGetter = (state: State) => any;
type StateSetter = (state: State) => void;

class GameState {
  state: State;
  display: ROT.Display;
  ecs: World;
  lastTime: number;

  constructor(initialState: State, display: ROT.Display, ecs: World) {
    this.state = initialState;
    this.display = display;
    this.ecs = ecs;
    this.lastTime = performance.now();
  }

  getState(getter?: StateGetter): any {
    if (getter) {
      return getter(this.state);
    }

    return this.state;
  }

  setState(setter: StateSetter): GameState {
    this.state = produce(this.state, setter);

    return this;
  }

  tick = throttle((): void => {
    const time = performance.now();
    const delta = time - this.lastTime;
    this.lastTime = time;

    const runState = this.getState(state => state.runState);
    if (runState !== RunState.MAINMENU) {
      this.display.clear();
      drawMap(this.getState(state => state.map));

      this.ecs.getSystem(RenderingSystem).execute(delta, time);

      drawGUI();
    }

    if (runState === RunState.PRERUN) {
      this.ecs.execute(delta, time);
      this.setState(state => {state.runState = RunState.AWAITINGINPUT});
    } else if (runState === RunState.AWAITINGINPUT) {
      // poll for input
    } else if (runState === RunState.PLAYERTURN) {
      this.ecs.execute(delta, time);
      this.setState(state => state.runState = RunState.MONSTERTURN);
    } else if (runState === RunState.MONSTERTURN) {
      this.ecs.execute(delta, time);
      this.setState(state => state.runState = RunState.AWAITINGINPUT);
    } else if (runState === RunState.SHOWINVENTORY) {
      // const result = showInventory();
      // if (result === ItemMenuResult.CANCEL) {
      //   this.setState(state => state.runState = RunState.AWAITINGINPUT);
      // } else if (result === ItemMenuResult.NORESPONSE) {

      // } else if (result === ItemMenuResult.SELECTED) {

      // }
    } else if (runState === RunState.SHOWDROPITEM) {
    } else if (runState === RunState.SHOWTARGETING) {
    } else if (runState === RunState.MAINMENU) {
    } else if (runState === RunState.SAVEGAME) {
    } else if (runState === RunState.RUNNING) {
    } else if (runState === RunState.PAUSED) {

    }
 }, 1000/60.0)

  gameLoop = () => {
    this.tick();

    requestAnimationFrame(this.gameLoop);
  }
}

export default GameState;

export const createSetter = (name: string, fn) => {
  return (...args): StateSetter => (state): void => {
    let before, after;
    if (ENABLE_LOGGING) {
      before = JSON.parse(JSON.stringify(state));
    }

    const newState = fn(...args)(state);

    if (ENABLE_LOGGING) {
      after = JSON.parse(JSON.stringify(state));
      console.log('Action:', name, ...args, { before, after });
    }
    
    return newState;    
  };
};
