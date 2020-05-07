import * as ROT from 'rot-js';
import setupKeys from './player';
import GameState, { RunState } from './state';
import { setRunState } from './setters';
import { setupDisplay } from './display';
import { createMap } from './map';
import { World } from 'ecsy';
import { RenderingSystem } from './ecs/systems';
import { createPlayer } from './ecs/entities';
import { Position } from './ecs/components';

import './assets/VGA8x16.png';

const WIDTH = 64;
const HEIGHT = 32;

const display = setupDisplay({
  width: WIDTH,
  height: HEIGHT
});

const ECS = new World();
ECS.registerSystem(RenderingSystem);
// stop rendering system from performing on its own

const map = createMap(WIDTH, HEIGHT);

const game = new GameState({
  runState: RunState.PRERUN,
  map: map.map,
}, display, ECS);

eval('window.game = game;');

const main = (): void => {
  const randomCenter = ROT.RNG.getItem(map.centers);

  game.playerID = createPlayer(ECS);
  const player = (game.ecs as any).entityManager.getEntityByName('player');

  player.getMutableComponent(Position).x = randomCenter[0];
  player.getMutableComponent(Position).y = randomCenter[1];
  setupKeys(game);

  game
    .setState(setRunState(RunState.PRERUN));

  game.gameLoop();
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.main .loading').remove();
  main();
});

export { game, ECS, display, WIDTH, HEIGHT };
