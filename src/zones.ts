import { Coordinates, Area, Action, TriggerType, Trigger, Zone } from './types';

export const TRIGGER_TYPES = {
  ENTER: 'ENTER',
  EXIT: 'EXIT',
  WITHIN: 'WITHIN'
};

export const createTrigger = (
  type: TriggerType,
  actions: Action[],
): Trigger => {
  return {
    type,
    actions
  };
};

export const createZone = (
  cells: Array<Coordinates | Area>,
  triggers: Trigger[]
): Zone => {
  return {
    cells,
    triggers
  };
}

const isCell = cellOrArea => cellOrArea.length === 2;
const isArea = cellOrArea => cellOrArea.length === 4;

export const isWithinZone = (x, y) => (zone) => {
  let isWithin = false;
  zone.cells.reduce((cells, cellOrArea) => {
    if (isArea(cellOrArea)) {
      const [x, y, w, h] = cellOrArea;
      const areaCells = [];
      for (let _x = x; _x <= x + w; _x++ ) {
        for (let _y = y; _y <= y + h; _y++) {
          cells.push([_x, _y]);
        }
      }
      cells.push(...areaCells);
    } else if (isCell(cellOrArea)) {
      cells.push(cellOrArea);
    }
    return cells;
  }, []).forEach(cell => {
    if (cell[0] === x && cell[1] === y) {
      isWithin = true;
    }
  });

  return isWithin;
}

isWithinZone(0, 0)({cells: [[0, 0]]});
