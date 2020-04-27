import * as ROT from 'rot-js';
import game, { action } from './state';
import { setupKeys } from './keys';
import { setupDisplay, draw } from './display';
import { setupMap } from './map';

export const WIDTH = 64;
export const HEIGHT = 32;
export const BOTTOM_PANEL_HEIGHT = 6;

let display: ROT.Display;

const playerInitialPos = {
  x: Math.floor(WIDTH / 2),
  y: Math.floor((HEIGHT - BOTTOM_PANEL_HEIGHT) / 2)
};
export const playerID = Object.keys(game.getState().entities)[0];
action('UPDATE_ENTITY_POSITION', { ...playerInitialPos, relative: false, id: playerID });

const setup = (): void => {
  display = setupDisplay({
    width: WIDTH,
    height: HEIGHT
  });

  setupKeys();

  setupMap();

  draw({ game, display });
};

setup();

game.subscribe(() => requestAnimationFrame(() => draw({ game, display })));
