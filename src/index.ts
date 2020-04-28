import * as ROT from 'rot-js';
import game from './state';
import { setupKeys } from './keys';
import { setupDisplay, draw } from './display';
import { setupMap } from './map';
import { setupEntities } from './entities';
import { ID } from './utils/id';

export const WIDTH = 64;
export const HEIGHT = 32;
export const BOTTOM_PANEL_HEIGHT = 6;

let display: ROT.Display;

export const playerID = ID();

const setup = (): void => {
  display = setupDisplay({
    width: WIDTH,
    height: HEIGHT
  });

  setupKeys();

  setupMap({ playerID });

  setupEntities({ playerID, WIDTH, HEIGHT, BOTTOM_PANEL_HEIGHT });

  game.dispatch({ type: 'CALCULATE_FOV', payload: {} })

  draw({ game, display });
};

window.addEventListener('DOMContentLoaded', setup);

game.subscribe(() => requestAnimationFrame(() => draw({ game, display })));
