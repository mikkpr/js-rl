import * as Redux from 'redux';
import * as ROT from 'rot-js';
import throttle from 'lodash/throttle';
import keymage from 'keymage';
import { GameStore, action } from './state';

type Direction = 'N' | 'E' | 'S' |'W';
const move = (dir: Direction) => throttle((): void => {
  const dirs = {
    N: [0, -1],
    E: [1, 0],
    S: [0, 1],
    W: [-1, 0]
  };
  const [dx, dy] = dirs[dir];
  action('COMMAND_MOVE', { dx, dy });
}, 16);

const get = (): void => {
  action('COMMAND_GET', {});
};

const dropItem = (idx) => (): void => {
  action('COMMAND_DROP', { idx });
};

const drop = (): void => {
  action('COMMAND_DROP_UI', {});
  keymage.setScope('inventory:drop');
};

const closeUI = (): void => {
  action('COMMAND_CLOSE', {});
  keymage.setScope('default');
};

const showInventory = (): void => {
  action('COMMAND_INVENTORY_UI', {});
  keymage.setScope('inventory');
};

const closeTopmostUIPanel = (): void => {
  action('COMMAND_CLOSE_TOP', {});
};

const openDoor = (): void => {
  action('COMMAND_OPEN_DOOR', {});
};

const closeDoor = (): void => {
  action('COMMAND_CLOSE_DOOR', {});
};

export const setupKeys = (): void => {
  keymage('default','h', move('W'));
  keymage('default','j', move('S'));
  keymage('default','k', move('N'));
  keymage('default','l', move('E'));

  keymage('default','left', move('W'));
  keymage('default','down', move('S'));
  keymage('default','up', move('N'));
  keymage('default','right', move('E'));

  keymage('default','a', move('W'));
  keymage('default','s', move('S'));
  keymage('default','w', move('N'));
  keymage('default','d', move('E'));

  keymage('default','g', get);
  keymage('inventory', 'd', drop);
  ['a','s','d','f','g','h','j','k','l'].forEach((key, idx) =>
    keymage('inventory:drop', key, dropItem(idx)));
  keymage('esc', closeUI);
  keymage('default', 'i', showInventory);
  keymage('backspace', closeTopmostUIPanel)

  keymage('o', openDoor);
  keymage('c', closeDoor);

  keymage.setScope('default');
};
