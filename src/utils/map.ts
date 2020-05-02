import { CELL_TYPES } from '../cells';
import { Map, Cell } from '../types';

export const cellKey = (x: number, y: number): string => `${x}_${y}`;

export const getAdjacentCells = (map: Map, cell: Cell) => {
  const { x, y } = cell;
  return {
    n: map[cellKey(x, y - 1)] || null,
    s: map[cellKey(x, y + 1)] || null,
    w: map[cellKey(x - 1, y)] || null,
    e: map[cellKey(x + 1, y)] || null
  };
};

export const fillRect = (x, y, w, h, type = CELL_TYPES.FLOOR): Cell[] => {
  const cells = [];

  for (let _y = y; _y <= y + h; _y++) {
    for (let _x = x; _x <= x + w; _x++) {
      cells.push({ x: _x, y: _y, type, contents: [] });
    }
  }

  return cells;
};
