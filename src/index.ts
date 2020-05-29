import {Display} from 'rot-js';
import createGameLoop from 'browser-game-loop';
import { inputs } from './keys';
import { match } from 'egna';

import { setupDisplay } from './setup';
import { STATS_HEIGHT, LOG_HEIGHT, WIDTH, HEIGHT, DIRS } from './constants';
import state, { setupEntities } from './state';
import { Health, Intent, Position } from './state/components';
import { RenderingSystem } from './state/systems';
import { CellType } from './map';
import { RunState } from './state/fsm';
import './assets';

export let loop;

const update = (delta: number) => {
  state.update();
};

const input = (player: string) => () => {
  const cmp = state.world.getComponentMap(player);
  if (!cmp.get(Health) as Health) { return; }
  if (state.getState().runState !== RunState.WAITING_INPUT) { return; }
  const move = inputs.getValue('MOVE');
  const dwim = inputs.getValue('DWIM');
  if (move) {
    const { dx, dy } = match(
      'N', () => DIRS.N,
      'E', () => DIRS.E,
      'S', () => DIRS.S,
      'W', () => DIRS.W,
      'NW', () => DIRS.NW,
      'NE', () => DIRS.NE,
      'SW', () => DIRS.SW,
      'SE', () => DIRS.SE,
      DIRS.NONE 
    )(move);

    state.world.registerComponent(player, {
      _type: Intent,
      intent: 'MOVE',
      payload: {
        dx, dy
      }
    } as Intent)
    state.setState(state => { state.runState = RunState.PLAYER_TURN; });
  } else if (dwim) {
    const pos = state.world.getComponentMap(player).get(Position) as Position;
    const neighbors = state.map.getNeighbors(pos.x, pos.y);
    let intent: string;
    let dir; 
    for (const key of Object.keys(neighbors)) {
      const cell = neighbors[key];
      if (cell === CellType.DOOR_CLOSED) {
        intent = 'OPEN_DOOR';
        dir = key;
        break;  
      } else if (cell === CellType.DOOR_OPEN) {
        intent = 'CLOSE_DOOR';
        dir = key;
        break;
      }
    }
    if (intent) {
      state.world.registerComponent(player, {
        _type: Intent,
        intent: intent,
        payload: DIRS[dir] 
      } as Intent)
      state.setState(state => { state.runState = RunState.PLAYER_TURN; });
    }
  }
  inputs.clear();
};

const render = (display) => (interpolation: number) => { 
  const renderingSystem = state.world.getSystem(RenderingSystem);
  display.clear();
  renderingSystem.draw({ layer: 'map' });
  renderingSystem.draw({ layer: 'entities' });
  renderingSystem.draw({ layer: 'gui' });
};

const main = () => {
  const display = setupDisplay({
    width: WIDTH,
    height: HEIGHT + STATS_HEIGHT + LOG_HEIGHT
  });

  state.display = display;

  document.querySelector('.main-container .loading').remove();

  const { player } = setupEntities();

  state.setState(state => {
    state.player = player;
    state.log = [];
  });

  loop = createGameLoop({
    updateTimeStep: 1000/60,
    fpsFilterStrength: 1,
    slow: 1,
    input: input(player),
    update,
    render: render(display),
  });

  loop.start();
}

document.addEventListener('DOMContentLoaded', () => {
  main();
});

