import { Display } from 'rot-js';
import createGameLoop from 'browser-game-loop';
import { input } from './keys';

import { setupDisplay } from './setup';
import { STATS_HEIGHT, LOG_HEIGHT, WIDTH, HEIGHT } from './constants';
import state, { setupEntities } from './state';
import { RenderingSystem } from './state/systems';
import './assets';

export let loop;

const update = (delta: number) => {
  state.update();
};

const render = (display: Display) => (interpolation: number) => { 
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

