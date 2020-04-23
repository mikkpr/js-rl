import * as ROT from 'rot-js';
import game from './gamestate';
import { getCanvasContainer } from './utils/dom';
import { createMapFromRooms } from './map';
import { pulseAberration } from './utils/render';


const [WIDTH, HEIGHT] = [21, 21];

export const display = new ROT.Display({
  width: WIDTH,
  height: HEIGHT,
  forceSquareRatio: true,
});

const setupDisplay = async () => {
  return new Promise((resolve) => {
    const canvasContainer = getCanvasContainer();
    canvasContainer.appendChild(display.getContainer());
    resolve();
  });
};

const cells = createMapFromRooms([
  {
    x: 0,
    y: 0,
    width: 21,
    height: 21,
    doors: [],
    char: '#',
    fg: '#fff',
    bg: '#000'
  }, {
    x: 4,
    y: 4,
    width: 13,
    height: 13,
    doors: [[4, 10]],
    char: '#',
    fg: '#fff',
    bg: '#000'
  }, {
    x: 8,
    y: 8,
    width: 5,
    height: 5,
    doors: [[12, 10]],
    char: '#',
    fg: '#fff',
    bg: '#000',
  }
]);

cells.forEach(cell => {
  game.dispatch({
    type: 'UPDATE_CELL',
    x: cell.x,
    y: cell.y,
    cell
  });
})

const renderMap = display => {
  const { map } = game.getState();

  const cells = Object.values(map);

  cells.forEach(cell => {
    const {
      x,
      y,
      char,
      fg,
      bg
    } = cell;
    display.draw(x, y, char, fg, bg);
  })
}

const renderPlayer = display => {
  const { player } = game.getState();
  const { x, y } = player;

  display.draw(x, y, '@', '#fff', '#000');
};

const redraw = (pulse = true) => {
  display.clear();

  renderMap(display);

  renderPlayer(display);

  if (pulse) {
    const randomIntensity = Math.floor(Math.random() * 5);
    const randomPhase = Math.floor(Math.random() * 50);
    pulseAberration(display, randomIntensity, randomPhase, () => redraw(false));
  }
};

const handleKeyup = (e) => {
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

  game.dispatch({ type: 'MOVE_PLAYER', dx, dy });
};

const setupInput = async () => {
  document.body.addEventListener('keydown', handleKeyup);
};

const setup = async () => {
  game.log('Setting up display...');
  await setupDisplay();
  setupInput();
  game.log('Setting up player...');
  game.log('Done.');
  game.clearLog();

  redraw();
};

setup();

game.subscribe(redraw);

window.game = game;
window.ROT = ROT;
window.display = display;
