export type LightingMap = {
  [id: string]: number;
}

export type ExplorationMap = {
  [id: string]: number;
};

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

export type Coordinates = [number, number];
export type Area = [number, number, number, number];
