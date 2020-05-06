import produce from 'immer';
import * as ROT from 'rot-js';
import { World } from 'ecsy';
import throttle from 'lodash/throttle';
import { WIDTH, HEIGHT } from '.';
import { CellType } from './map';
const ENABLE_LOGGING = false;

export enum RunState {
  PRERUN = 'PRERUN',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
}

export type State = {
  player: {
    x: number;
    y: number;
  };
  runState: RunState;
  map: CellType[];
}

type PartialState = {
  [key: string]: any;
}

type StateGetter = (state: State) => PartialState;

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

  getState(getter?: StateGetter): PartialState {
    if (getter) {
      return getter(this.state);
    }

    return this.state;
  }

  setState(setters: Array<StateSetter> | (StateSetter)): GameState {
    let fns = setters;
    if (typeof setters === 'function') {
      fns = [setters];
    }

    const newState = (fns as Array<StateSetter>).reduce((state, setter) => produce(state, setter), this.state);
    this.state = newState;

    return this;
  }

  tick = throttle((): void => {
    const time = performance.now();
    const delta = time - this.lastTime;

    this.ecs.execute(delta, time);

    this.lastTime = time;

    const { player, map } = this.getState(state => ({ player: state.player, map: state.map }));
    this.display.clear();

    for (let idx = 0; idx < map.length; idx++) {
      const x = idx % WIDTH;
      const y = ~~(idx / WIDTH);
      const glyph = map[idx] === CellType.FLOOR ? '.' : '#';
      this.display.draw(x, y, glyph, '#aaa', '#000');
    }
  }, 16)

  gameLoop = () => {
    const { running } = this.getState(state => ({ running: state.runState === RunState.RUNNING }));

    if (running) {
      this.tick();
    }
  
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