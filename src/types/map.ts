export type CellType = 'FLOOR' | 'WALL';

export type Cell = {
  x: number;
  y: number;
  contents: string[];
  type: CellType;
};

export type Map = {
  [key: string]: Cell;
}