import * as ROT from 'rot-js';
import game from './state';
import { setupKeys } from './keys';
import { setupDisplay, draw } from './display';

import './fonts';

export const WIDTH = 64;
export const HEIGHT = 32;
export const BOTTOM_PANEL_HEIGHT = 6;

const WORLD_WIDTH = 64;
const WORLD_HEIGHT = 32;

let display: ROT.Display;

const hideLoadingText = () => {
  document.querySelector('.main .loading').remove();
};

const setup = (): void => {
  display = setupDisplay({
    width: WIDTH,
    height: HEIGHT
  });

  game.dispatch({ type: 'BEGIN_SETUP', payload: { WORLD_WIDTH, WORLD_HEIGHT } });

  hideLoadingText();

  setupKeys();
};

window.addEventListener('DOMContentLoaded', setup);

game.subscribe(() => requestAnimationFrame(() => draw({ game, display })));
