import * as ROT from 'rot-js';
import game from './gamestate';
import { getCanvasContainer } from './utils/dom';
import { CELL_PROPERTIES, CELL_TYPES, createMapFromRooms, level0, level0portals } from './map';
import { redraw } from './utils/render';

export const [WIDTH, HEIGHT] = [21, 21];

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

const initialCells = createMapFromRooms(level0);

// const em = new ROT.Map.Cellular(WIDTH*4, HEIGHT*4);
// em.randomize(0.5);
// em.create();
// em.create();
// em.create();
// em.create();
// const initialCells = [];
// em.create((x, y, solid) => {
//   initialCells.push({
//     x: x - 2*WIDTH,
//     y: y - 2*HEIGHT,
//     char: solid ? '#' : '.',
//     fg: '#FFF',
//     bg: '#000',
//     solid: !!solid
//   })
// });

game.dispatch({
  type: 'UPDATE_CELLS',
  cells: initialCells,
});

const initialPortals = level0portals;
game.dispatch({
  type: 'UPDATE_PORTALS',
  portals: initialPortals,
});

const floorCells = Object.values(game.getState().map).filter(cell => !CELL_PROPERTIES[cell.type].solid);
const randomCell = ROT.RNG.getItem(floorCells);
game.dispatch({ type: 'SET_PLAYER_POSITION', position: [randomCell.x, randomCell.y] });

game.dispatch({ type: 'CALCULATE_FOV' });

const handleKeyup = (e) => {
  const code = e.keyCode;

  const wasd = [
    ROT.KEYS.VK_W,
    ROT.KEYS.VK_A,
    ROT.KEYS.VK_S,
    ROT.KEYS.VK_D,
  ];

  const vim = [
    ROT.KEYS.VK_K,
    ROT.KEYS.VK_H,
    ROT.KEYS.VK_J,
    ROT.KEYS.VK_L,
  ];

  const arrows = [
    ROT.KEYS.VK_UP,
    ROT.KEYS.VK_LEFT,
    ROT.KEYS.VK_DOWN,
    ROT.KEYS.VK_RIGHT,
  ];

  const [INDEX_UP, INDEX_LEFT, INDEX_DOWN, INDEX_RIGHT] = [0, 1, 2, 3];

  let dx = 0;
  let dy = 0;

  if ([wasd[INDEX_LEFT], vim[INDEX_LEFT], arrows[INDEX_LEFT]].includes(code)) {
    dx -= 1;
  }
  if ([wasd[INDEX_DOWN], vim[INDEX_DOWN], arrows[INDEX_DOWN]].includes(code)) {
    dy += 1;
  }
  if ([wasd[INDEX_RIGHT], vim[INDEX_RIGHT], arrows[INDEX_RIGHT]].includes(code)) {
    dx += 1;
  }
  if ([wasd[INDEX_UP], vim[INDEX_UP], arrows[INDEX_UP]].includes(code)) {
    dy -= 1;
  }

  if (dx !== 0 || dy !== 0) {
    return game.dispatch({ type: 'MOVE_PLAYER', dx, dy });
  }

  if (code === ROT.KEYS.VK_O) {
    return game.dispatch({ type: 'COMMAND_OPEN' });
  }

  if (code === ROT.KEYS.VK_C) {
    return game.dispatch({ type: 'COMMAND_CLOSE' });
  }
};

const setupInput = async () => {
  document.body.addEventListener('keyup', handleKeyup);
};

const setup = async () => {
  await setupDisplay();
  setupInput();

  requestAnimationFrame(redraw);
};

setup();

game.subscribe(() => requestAnimationFrame(redraw));

window.game = game;
window.ROT = ROT;
window.display = display;
