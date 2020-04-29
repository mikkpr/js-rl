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
  action('CLOSE_UI', {});
  keymage.setScope('default');
};

const drop = (): void => {
  action('SHOW_DROP_PANEL', {});
  keymage.setScope('inventory:drop');
};

const closeUI = (): void => {
  action('CLOSE_UI', {});
  keymage.setScope('default');
};

const showInventory = (): void => {
  action('SHOW_INVENTORY_PANEL', {});
  keymage.setScope('inventory');
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

  keymage.setScope('default');
};
