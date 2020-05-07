import setupKeys from './player';
import GameState, { RunState } from './state';
import { setRunState } from './setters';
import { setupDisplay } from './display';
import { createMap } from './map';
import { World } from 'ecsy';
import { RenderingSystem } from './ecs/systems';
import { createPlayer } from './ecs/entities';

import './assets/ibm_vga8.eot';
import './assets/ibm_vga8.ttf';
import './assets/ibm_vga8.woff';
import './assets/ibm_vga8.woff2';
import './assets/VGA8x16.png';

const WIDTH = 64;
const HEIGHT = 32;

const display = setupDisplay({
  width: WIDTH,
  height: HEIGHT
});

const ECS = new World();

const game = new GameState({
  runState: RunState.PRERUN,
  map: createMap(WIDTH, HEIGHT)
}, display, ECS);

eval('window.game = game;');

const main = (): void => {
  const playerInitialPos = {
    x: WIDTH / 2,
    y: HEIGHT / 2
  };

  createPlayer(ECS, playerInitialPos.x, playerInitialPos.y);

  setupKeys(game);

  ECS.registerSystem(RenderingSystem);
  const rendering = ECS.getSystem(RenderingSystem);
  rendering.stop();

  game
    .setState(setRunState(RunState.PRERUN));

  game.gameLoop();
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.main .loading').remove();
  requestAnimationFrame(main);
});

export { game, ECS, display, WIDTH, HEIGHT };
