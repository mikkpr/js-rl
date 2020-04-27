import * as ROT from 'rot-js';
import keymage from 'keymage';
import setupKeys from './keys';
import game, { action } from './state';
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

const playerInitialPos = {
  x: WIDTH / 2,
  y: HEIGHT / 2
};
action('UPDATE_PLAYER_POSITION', { ...playerInitialPos, relative: false });

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