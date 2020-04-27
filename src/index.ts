import * as ROT from 'rot-js';
import game, { action } from './state';
import { setupKeys } from './keys';
import { setupDisplay, drawMap, drawPlayer, drawUI } from './display';
import { setupMap } from './map';

export const WIDTH = 64;
export const HEIGHT = 32;
export const BOTTOM_PANEL_HEIGHT = 6;

let display: ROT.Display;

export const draw = (): void => {
  display.clear();

  drawMap({ game, display });

  drawPlayer({ game, display });

  drawUI({ game, display });
};

const playerInitialPos = {
  x: Math.floor(WIDTH / 2),
  y: Math.floor((HEIGHT - BOTTOM_PANEL_HEIGHT) / 2)
};
action('UPDATE_PLAYER_POSITION', { ...playerInitialPos, relative: false });

const setup = (): void => {
  display = setupDisplay({
    width: WIDTH,
    height: HEIGHT
  });

  setupKeys();

  setupMap();

  draw();
};

setup();

game.subscribe(() => requestAnimationFrame(draw));
