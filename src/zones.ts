import { getZoneCells } from './utils/zones';

export enum TRIGGER_TYPES {
  ENTER = 'ENTER',
  EXIT = 'EXIT',
  WITHIN = 'WITHIN'
}

export const isWithinZone = (x, y) => (zone) => {
  let isWithin = false;
  getZoneCells(zone).forEach(cell => {
    if (cell[0] === x && cell[1] === y) {
      isWithin = true;
    }
  });

  return isWithin;
};
