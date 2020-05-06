import setupKeys from './keys';
import GameState, { RunState } from './state';
import { setPlayerPosition, setRunState } from './setters';
import { setupDisplay } from './display';
import { createMap } from './map';
import ECS from './ecs';
import { RenderingSystem } from './ecs/systems';

import './assets/ibm_vga8.eot';
import './assets/ibm_vga8.ttf';
import './assets/ibm_vga8.woff';
import './assets/ibm_vga8.woff2';

const WIDTH = 64;
const HEIGHT = 32;

const display = setupDisplay({
  width: WIDTH,
  height: HEIGHT
});

const game = new GameState({
  player: {
    x: 0,
    y: 0,
  },
  runState: RunState.PRERUN,
  map: createMap(WIDTH, HEIGHT)
}, display, ECS);

ECS.registerSystem(RenderingSystem, { display });

eval('window.game = game;');

const main = (): void => {
  setupKeys();

  const playerInitialPos = {
    x: WIDTH / 2,
    y: HEIGHT / 2
  };
  game
    .setState(setPlayerPosition(playerInitialPos.x, playerInitialPos.y))
    .setState(setRunState(RunState.RUNNING));

  game.gameLoop();
};

main();

export { game, WIDTH, HEIGHT };