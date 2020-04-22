import * as ROT from 'rot-js';
import game from './gamestate';
import { getCanvasContainer } from './utils/dom';
import { setupPlayer } from './player';

const [WIDTH, HEIGHT] = [21, 21];

export const display = new ROT.Display({
  width: WIDTH,
  height: HEIGHT,
  forceSquareRatio: true,
});
let player = undefined;
setupPlayer().then(p => player = p);

const setupDisplay = async () => {
  return new Promise((resolve) => {
    const canvasContainer = getCanvasContainer();
    canvasContainer.appendChild(display.getContainer());
    resolve();
  });
};

const setupInput = async () => {
  const handleKeyup = e => {
    const code = e.keyCode;
    let dx = 0;
    let dy = 0;
    if ([ROT.KEYS.VK_A, ROT.KEYS.VK_H, ROT.KEYS.VK_LEFT].includes(code)) {
      dx -= 1;
    }
    if ([ROT.KEYS.VK_S, ROT.KEYS.VK_J, ROT.KEYS.VK_DOWN].includes(code)) {
      dy += 1;
    }
    if ([ROT.KEYS.VK_D, ROT.KEYS.VK_L, ROT.KEYS.VK_RIGHT].includes(code)) {
      dx += 1;
    }
    if ([ROT.KEYS.VK_W, ROT.KEYS.VK_K, ROT.KEYS.VK_UP].includes(code)) {
      dy -= 1;
    }

    if (dx === 0 && dy === 0) { return; }

    display.clear();
    player.move(dx, dy);
    player.draw(display);
    game.log(`Moving: [x: ${ player.x }, y: ${ player.y }]`)
  }
  document.body.addEventListener('keydown', handleKeyup);
}

const setup = async () => {
  game.log('Setting up display...');
  await setupDisplay();
  setupInput();
  game.log('Setting up player...');
  player.draw(display);
  game.log('Done.');
  game.clearLog();
};

setup();

window.game = game;
window.ROT = ROT;
window.display = display;
