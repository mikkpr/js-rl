import * as Redux from 'redux';
import * as ROT from 'rot-js';
import keymage from 'keymage';
import { GameStore, action } from './state';

type Direction = 'N' | 'E' | 'S' |'W';
const move = (dir: Direction) => (): void => {
  const dirs = {
    N: [0, -1],
    E: [1, 0],
    S: [0, 1],
    W: [-1, 0]
  };
  const [dx, dy] = dirs[dir];
  action('COMMAND_MOVE', { dx, dy });
}

const setupKeys = (): void => {
  keymage('k', move('N'));
  keymage('l', move('E'));
  keymage('j', move('S'));
  keymage('h', move('W'));
}

export default setupKeys;