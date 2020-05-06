import { WIDTH, HEIGHT } from '.';

export enum CellType {
  FLOOR,
  WALL
};

const xyIdx = (x: number, y: number): number => y * WIDTH + x;

export const createMap = (w: number, h: number): number[] => {
  const map = (new Array(w * h)).fill(CellType.WALL);

  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      map[xyIdx(x, y)] = CellType.FLOOR;
    }
  }

  return map;
};

