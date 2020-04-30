import { Color } from '.';

export type LightingMap = {
  [id: string]: Color;
}

export type VisibilityMap = {
  [id: string]: number;
}

export type ExplorationMap = {
  [id: string]: number;
};

export type CellType = 'FLOOR' | 'WALL' | 'DOOR_OPEN' | 'DOOR_CLOSED';

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
export interface Position {
  x: number;
  y: number;
}
export type Area = [number, number, number, number];

export type CardinalDirection = 'north' | 'south' | 'east' | 'west';
