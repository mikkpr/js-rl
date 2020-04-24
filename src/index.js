import * as ROT from 'rot-js';
import game from './gamestate';
import { getCanvasContainer } from './utils/dom';
import { CELL_PROPERTIES, CELL_TYPES, createMapFromRooms, level0, level0portals } from './map';
import { redraw } from './utils/render';
import keymage from 'keymage';

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

const moveUp = () => {
  game.dispatch({ type: 'MOVE_PLAYER', dx: 0, dy: -1 });
};

const moveDown = () => {
  game.dispatch({ type: 'MOVE_PLAYER', dx: 0, dy: 1 });
};

const moveLeft = () => {
  game.dispatch({ type: 'MOVE_PLAYER', dx: -1, dy: 0 });
};

const moveRight = () => {
  game.dispatch({ type: 'MOVE_PLAYER', dx: 1, dy: 0 });
};

const setupInput = async () => {
  keymage('o', () => game.dispatch({ type: 'COMMAND_OPEN' }));
  keymage('c', () => game.dispatch({ type: 'COMMAND_CLOSE' }));
  ['k', 'w', 'up'].forEach(key => keymage(key, moveUp));
  ['j', 's', 'down'].forEach(key => keymage(key, moveDown));
  ['h', 'a', 'left'].forEach(key => keymage(key, moveLeft));
  ['l', 'd', 'right'].forEach(key => keymage(key, moveRight));
  // keymage('space', () => { keymage.setScope('space'); game.log('SPC-'); });
  // keymage('space i', () => { keymage.setScope('space.i'); game.log('SPC-i-'); });
  // keymage('space i i', () => { keymage.setScope(''); game.log('show inventory'); });
  // keymage('esc', () => { keymage.setScope(''); game.log('close UI'); });
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
