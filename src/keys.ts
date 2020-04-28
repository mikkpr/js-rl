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
}, 16)

export const setupKeys = (): void => {
  keymage('k', move('N'));
  keymage('w', move('N'));
  keymage('up', move('N'));
  keymage('l', move('E'));
  keymage('d', move('E'));
  keymage('right', move('E'));
  keymage('j', move('S'));
  keymage('s', move('S'));
  keymage('down', move('S'));
  keymage('h', move('W'));
  keymage('a', move('W'));
  keymage('left', move('W'));
};
