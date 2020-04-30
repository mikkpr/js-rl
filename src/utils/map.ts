import { Map, Cell } from '../types';

export const cellKey = (x: number, y: number): string => `${x}_${y}`;

export const getAdjacentCells = (map: Map, cell: Cell) => {
  const { x, y } = cell;
  const adjacentCoords = [
    [x-1, y],
    [x+1, y],
    [x, y-1],
    [x, y+1]
  ];
  const cells = [];
  for (const coords of adjacentCoords) {
    const [_x, _y] = coords;
    if (map[cellKey(_x, _y)]) {
      cells.push(map[cellKey(_x, _y)]);
    }
  }

  return cells;
}
