import { WIDTH, HEIGHT } from '.';

export enum CellType {
  FLOOR,
  WALL
}

export type Map = CellType[];

export const xyIdx = (x: number, y: number): number => y * WIDTH + x;

export const isBlocked = (map, idx) => {
  return map[idx] && map[idx] === CellType.WALL;
};

export const createMap = (w: number, h: number): Map => {
  const map = (new Array(w * h)).fill(CellType.WALL);

  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      map[xyIdx(x, y)] = CellType.FLOOR;
    }
  }

  return map;
};

