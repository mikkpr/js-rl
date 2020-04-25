import * as ROT from 'rot-js';
import game from './gamestate';
import keymage from 'keymage';
import { CELL_PROPERTIES, CELL_TYPES, createMapFromRooms, level0, level0portals } from './map';
import { generateItems } from './items';
import { getCanvasContainer } from './utils/dom';
import { redraw } from './utils/render';

export const [WIDTH, HEIGHT] = [21, 21];

export const display = new ROT.Display({
  width: WIDTH,
  height: HEIGHT,
  forceSquareRatio: true,
});
display.setOptions({
  fontFamily: 'Major Mono Display',
  fontStyle: 'bold'
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

const items = generateItems();
game.dispatch({ type: 'ADD_ITEMS', items });

const keyCell = ROT.RNG.getItem(floorCells);
game.dispatch({
  type: 'UPDATE_CELL',
  cell: {
    ...keyCell,
    contents: [items[0].id],
  },
});

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

const openInventory = (drop = false) => {
  game.dispatch({ type: 'OPEN_UI_PANEL', panel: drop ? 'INVENTORY.DROP' : 'INVENTORY' });
};

const closeUI = () => {
  game.dispatch({ type: 'CLOSE_UI_PANEL' });
};

const setupInput = async () => {
  keymage.setScope('default');
  keymage('default', 'o', () => game.dispatch({ type: 'COMMAND_OPEN' }));
  keymage('default', 'c', () => game.dispatch({ type: 'COMMAND_CLOSE' }));
  keymage('default', 'g', () => game.dispatch({ type: 'COMMAND_GET' }));
  ['k', 'w', 'up'].forEach(key => keymage('default', key, moveUp));
  ['j', 's', 'down'].forEach(key => keymage('default', key, moveDown));
  ['h', 'a', 'left'].forEach(key => keymage('default', key, moveLeft));
  ['l', 'd', 'right'].forEach(key => keymage('default', key, moveRight));
  // keymage('default', 'space', () => { keymage.setScope('space'); game.log('SPC-'); });
  // keymage('space', 'space i', () => { keymage.setScope('space.i'); game.log('SPC-i-'); });
  keymage('default', 'i', () => { keymage.setScope('inventory'); openInventory(); });
  keymage('esc', () => { keymage.setScope('default'); closeUI(); });
  keymage('inventory', 'd', () => {
    if (game.getState().inventory.length > 0) {
      openInventory(true);
      keymage.setScope('inventory.drop');
    }
  });
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].forEach((key, idx) => {
    keymage('inventory.drop', key, () => {
      keymage.setScope('inventory');
      openInventory();
      game.dispatch({ type: 'COMMAND_DROP', idx });
    });
  });

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
