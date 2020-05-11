import { Entity, World } from 'ecsy';
import produce from 'immer';
import * as ROT from 'rot-js';
import { RenderingSystem, VisibilitySystem } from './ecs/systems';
import { CellType } from './map';
import { drawHoveredInfo } from './display';

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
  rooms: number[][];
  centers: number[][];
  scores: number[];
  hoveredTileIdx?: number;
}

type StateGetter = (state: State) => any;
type StateSetter = (state: State) => void;

class GameState {
  state: State;
  display: ROT.Display;
  ecs: World;
  lastTime: number;
  player?: Entity;
  cameraOffset: [number, number];

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

  executeSystemsAndProceed = (nextRunState: RunState, delta: number, time: number): void => {
    requestAnimationFrame(() => this.ecs.execute(delta, time));
    this.setState(state => {state.runState = nextRunState; });
  }

  proceed = (nextRunState): void => {
    this.setState(state => {state.runState = nextRunState; });
  }

  render = (delta, time): void => {
    this.display.clear();

    this.ecs.getSystem(VisibilitySystem).execute(delta, time);
    this.ecs.getSystem(RenderingSystem).execute(delta, time);

    drawHoveredInfo();
  }

  tick = (): void => {
    const time = performance.now();
    const delta = time - this.lastTime;
    this.lastTime = time;
    const runState = this.getState(state => state.runState);
    if (runState !== RunState.MAINMENU) {
      this.render(delta, time);
    }
    if (runState === RunState.PRERUN) {
      this.executeSystemsAndProceed(RunState.AWAITINGINPUT, delta, time);
    } else if (runState === RunState.AWAITINGINPUT) {
      // poll for input
    } else if (runState === RunState.PLAYERTURN) {
      this.proceed(RunState.MONSTERTURN);
    } else if (runState === RunState.MONSTERTURN) {
      this.executeSystemsAndProceed(RunState.AWAITINGINPUT, delta, time);
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

    requestAnimationFrame(this.tick);
  }

  gameLoop = (): void => {
    this.tick();
  }
}

export default GameState;
