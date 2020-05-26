import {Display} from 'rot-js';
import createGameLoop from 'browser-game-loop';
import { inputs } from './keys';
import { match } from 'egna';

import { setupDisplay } from './setup';
import { WIDTH, HEIGHT } from './constants';
import state, { setupEntities } from './ecs';
import { Intent } from './ecs/components/intent';
import { RenderingSystem } from './ecs/systems';
import './assets';

export let loop;

const update = (delta: number) => {
  state.update();
};

const input = (player: string) => () => {
  const move = inputs.getValue('MOVE');
  if (move) {
    const { dx, dy } = match(
      'N', () => ({ dx: 0, dy: -1 }),
      'E', () => ({ dx: 1, dy: 0 }),
      'S', () => ({ dx: 0, dy: 1 }),
      'W', () => ({ dx: -1, dy: 0 }),
      'NW', () => ({ dx: -1, dy: -1 }),
      'NE', () => ({ dx: 1, dy: -1 }),
      'SW', () => ({ dx: -1, dy: 1 }),
      'SE', () => ({ dx: 1, dy: 1 }),
      { dx: 0, dy: 0 }
    )(move);

    state.world.registerComponent(player, {
      _type: Intent,
      intent: 'MOVE',
      payload: {
        dx, dy
      }
    } as Intent)

  }
  inputs.clear();
};

const render = (display) => (interpolation: number) => { 
  const renderingSystem = state.world.getSystem(RenderingSystem);
  display.clear();
  renderingSystem.draw({ display });
};

const main = () => {
  const display = setupDisplay({
    width: WIDTH,
    height: HEIGHT
  });

  document.querySelector('.main-container .loading').remove();

  const { player } = setupEntities({
    playerX: ~~(WIDTH / 2),
    playerY: ~~(HEIGHT / 2),
  });

  state.setState(state => { state.player = player; });

  loop = createGameLoop({
    updateTimeStep: 1000/30,
    fpsFilterStrength: 2,
    input: input(player),
    update,
    render: render(display),
  });

  loop.start();
}

document.addEventListener('DOMContentLoaded', () => {
  main();
});

