import * as ROT from 'rot-js';
import setupKeys from './player';
import GameState, { RunState } from './state';
import { setupDisplay } from './display';
import { createMap } from './map';
import { World } from 'ecsy';
import {
  RenderingSystem,
  VisibilitySystem
} from './ecs/systems';
import { createPlayer } from './ecs/entities';
import { Renderable, Viewshed, Position } from './ecs/components';

import './assets/VGA8x16.png';
import './assets/ibm_vga8.eot';
import './assets/ibm_vga8.woff';
import './assets/ibm_vga8.woff2';
import './assets/ibm_vga8.ttf';

const WIDTH = 64;
const HEIGHT = 32;

const display = setupDisplay({
  width: WIDTH,
  height: HEIGHT
});

const ECS = new World();
ECS.registerComponent(Position);
ECS.registerComponent(Viewshed);
ECS.registerComponent(Renderable);
ECS.registerSystem(RenderingSystem);
ECS.registerSystem(VisibilitySystem);

const map = createMap(WIDTH, HEIGHT);

const game = new GameState({
  runState: RunState.PRERUN,
  map: map.map,
}, display, ECS);

eval('window.game = game;');

const main = (): void => {
  const randomCenter = ROT.RNG.getItem(map.centers);

  createPlayer(ECS, randomCenter[0], randomCenter[1]);
  game.player = (game.ecs as any).entityManager.getEntityByName('player');

  setupKeys(game);

  game.setState(state => { state.runState = RunState.PRERUN; });

  game.gameLoop();
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.main .loading').remove();
  main();
});

export { game, ECS, display, WIDTH, HEIGHT };
