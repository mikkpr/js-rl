import { match } from 'egna';
import { Mrpas } from 'mrpas';
import { DIRS } from './constants';

export enum CellType {
  FLOOR = 'FLOOR',
  WALL = 'WALL',
  DOOR_OPEN = 'DOOR_OPEN',
  DOOR_CLOSED = 'DOOR_CLOSED'
};

const CellGlyphs = {
  [CellType.FLOOR]: '∙',
  [CellType.WALL]: '▓',
  [CellType.DOOR_OPEN]: '\'',
  [CellType.DOOR_CLOSED]: '+',
}

const CellColors = {
  [CellType.FLOOR]: '#666',
  [CellType.WALL]: '#999',
  [CellType.DOOR_OPEN]: '#aa0',
  [CellType.DOOR_CLOSED]: '#aa0',
}

export class WorldMap {
  cells: CellType[];
  width: number;
  height: number;
  fov: Mrpas;
  locations: Map<string, number>;
  entities: Map<number, string>;

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.cells = (new Array(w * h)).fill(CellType.FLOOR);
    this.setMapFromString(DEBUGMAP);

    this.locations = new Map<string, number>();
    this.entities = new Map<number, string>();

    this.fov = new Mrpas(this.width, this.height, this.isTransparent);
  }

  getIdx = (x: number, y: number): number => {
    return y * this.width + x;
  }

  setMapFromString(str: string) {
    const rows = str.trim().split('\n');
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.split('');
      for (let j = 0; j < cells.length; j++) {
        const cell = match(
          '0', CellType.FLOOR,
          '1', CellType.WALL,
          '2', CellType.DOOR_OPEN,
          '3', CellType.DOOR_CLOSED
        )(cells[j]);
        this.setCell(j, i, cell);
      }
    } 
  }

  getCell = (...args: number[]): CellType | null => {
    let idx: number;
    if (args.length === 1) {
      [idx] = args;
    } else if (args.length === 2) {
      const [x, y] = args;
      idx = this.getIdx(x, y);
    }

    if (idx >= 0 && idx < this.cells.length) {
      return this.cells[idx];
    } else {
      return null;
    }
  } 

  setCell = (...args: [number, CellType] | [number, number, CellType]) => {
    let idx: number;
    let type: CellType;
    if (args.length === 2) {
      [idx, type] = args;
    } else if (args.length === 3) {
      let x: number;
      let y: number;
      [x, y, type] = args;
      idx = this.getIdx(x, y);
    }
    if (idx >= 0 && idx < this.cells.length) {  
      this.cells[idx] = type;
      return true;
    } else {
      return false;
    }
  }

  getNeighbors = (...args: number[]) => {
    let x: number;
    let y: number;
    if (args.length === 1) {
      let [idx] = args;
      x = idx % this.width;
      y = ~~(idx / this.width);
    } else {
      [x, y] = args;
    }

    const cell = this.getCell(...args);
    if (!cell) { return []; }

    const neighbors = {};  
    for (const key of Object.keys(DIRS).filter(k => k !== 'NONE')) {
      const { dx, dy } = DIRS[key];
      const n = this.getCell(x + dx, y + dy);
      neighbors[key] = n;
    }

    return neighbors;
  }

  getCellGlyph = (...args: number[]) => {
    const cell = this.getCell(...args);
    return CellGlyphs[cell];
  }

  getCellColor = (...args: number[]) => {
    const cell = this.getCell(...args);
    return CellColors[cell];
  }

  isSolid = (...args: number[]) => {
    const cell = this.getCell(...args);
    const solidCellTypes = [
      CellType.WALL,
      CellType.DOOR_CLOSED,
    ];

    return solidCellTypes.includes(cell);
  }

  isTransparent = (...args: number[]) => {
    const cell = this.getCell(...args);
    const transparentCellTypes = [
      CellType.FLOOR,
      CellType.DOOR_OPEN,
    ];

    return transparentCellTypes.includes(cell);
  }

  setEntityLocation = (entity: string, idx: number) => {
    const prevIdx = this.getEntityLocation(entity);
    this.locations.set(entity, idx);
    if (typeof prevIdx !== 'undefined') {
      this.entities.delete(prevIdx);
      this.entities.set(idx, entity);
    }
  }

  getEntityLocation = (entity: string) => {
    return this.locations.get(entity);
  }

  removeEntity = (entity: string) => {
    const prevIdx = this.getEntityLocation(entity);
    this.locations.delete(entity);
    if (typeof prevIdx !== 'undefined') {
      this.entities.delete(prevIdx);
    }
  }
};

const DEBUGMAP = `
11111111111111111111111111111111111111111111111111
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
11111111111111111111111111211111111111111111111111
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000001
11111111111111111111111111111111111111111111111111
`;
