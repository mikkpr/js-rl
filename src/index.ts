import {Display} from 'rot-js';
import createGameLoop from 'browser-game-loop';
import { inputs } from './keys';
import { match } from 'egna';

import { setupDisplay } from './setup';
import { WIDTH, HEIGHT } from './constants';
import './assets';

let loop;

let X = ~~(WIDTH / 2);
let Y = ~~(HEIGHT / 2);

const update = (delta: number) => {

};

const input = () => {
  const move = inputs.getValue('MOVE');
  if (move) {
    match(
      'N', () => Y -= 1,
      'E', () => X += 1,
      'S', () => Y += 1,
      'W', () => X -= 1,
      _ => {}
    )(move);
  }
  inputs.clear();
};

const render = (display) => (interpolation: number) => {
  if (!display) { return; }
  display.clear();
  display.draw(X, Y, '@', '#fa0', '#000');
  display.drawText(WIDTH - 7, 1, `FPS: ${loop && loop.getFps().toFixed(0)}`);
};

const main = () => {
  const display = setupDisplay({
    width: WIDTH,
    height: HEIGHT
  });

  document.querySelector('.main-container .loading').remove();

  loop = createGameLoop({
    updateTimeStep: 1000/30,
    fpsFilterStrength: 2,
    input,
    update,
    render: render(display),
  });

  loop.start();
}

document.addEventListener('DOMContentLoaded', () => {
  main();
});
