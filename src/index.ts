import * as ROT from 'rot-js';
import keymage from 'keymage';
import setupKeys from './keys';
import game from './state';
import { updatePlayerPosition } from './actions/player';
import { setupDisplay } from './display';

const WIDTH = 64;
const HEIGHT = 32;

let display: ROT.Display;

export const draw = (): void => {
  const { player } = game.getState();
  display.clear();

  for (let i=0; i < HEIGHT; i++) {
    display.drawText(0, i, '%c{#444}................................................................');
  }

  display.draw(player.x, player.y, '@', '#aa0', '#000');
};

const playerInitialPos = [WIDTH / 2, HEIGHT / 2];
updatePlayerPosition(game)(playerInitialPos[0], playerInitialPos[1], false);

const setup = (): void => {
  display = setupDisplay({
    width: WIDTH,
    height: HEIGHT
  });

  setupKeys();

  draw();
};
setup();

game.subscribe(() => requestAnimationFrame(draw));