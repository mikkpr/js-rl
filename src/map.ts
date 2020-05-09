import * as ROT from 'rot-js';
import { MAPHEIGHT, MAPWIDTH } from '.';

// Map generation parameters
const MIN_SIZE = 3;
const MAX_SIZE = 8;
const MAX_ROOMS = 20;
const MIN_ROOMS = 10;
const CA_ALIVE = 4;
const CA_DEAD = 6;
const CA_ITER = 10;

export type Rect = [number, number, number, number];

export enum CellType {
  FLOOR,
  WALL
}

export type Map = CellType[];

export const xyIdx = (x: number, y: number): number => y * MAPWIDTH + x;

export const lightPasses = (map: Map, idx: number): boolean => {
  return !!(idx >= 0 && idx < map.length && map[idx] === CellType.FLOOR);
};

export const isPassable = (map: Map, idx: number): boolean => {
  return !!(idx >= 0 && idx < map.length && map[idx] === CellType.FLOOR);
};

const fillSquare = (map: Map, x: number, y: number, w: number, h: number, type: CellType = CellType.FLOOR): void => {
  for (let _x = x; _x < x + w; _x++) {
    for (let _y = y; _y < y + h; _y++) {
      const idx = xyIdx(_x, _y);
      map[idx] = type;
    }
  }
};

const overlaps = (rect1: Rect, rect2: Rect): boolean => {
  const [rect1x, rect1y, rect1w, rect1h] = rect1;
  const [rect2x, rect2y, rect2w, rect2h] = rect2;

  return rect1x <= rect2x + rect2w && rect1x + rect1w >= rect2x && rect1y <= rect2y + rect2h && rect1y + rect1h >= rect2y;
};

const getCenter = (rect: Rect): number[] => {
  const [x, y, w, h] = rect;

  return [~~((x + x + w)/2), ~~((y + y + h)/2)];
};

const drawHorizontalLine = (
  map: Map,
  x1: number,
  x2: number,
  y: number,
  type: CellType = CellType.FLOOR
): void => {
  for (let _x = Math.min(x1, x2); _x <= Math.max(x1, x2); _x++) {
    const idx = xyIdx(_x, y);
    map[idx] = type;
  }
};

const drawVerticalLine = (
  map: Map,
  y1: number,
  y2: number,
  x: number,
  type: CellType = CellType.FLOOR
): void => {
  for (let _y = Math.min(y1, y2); _y <= Math.max(y1, y2); _y++) {
    const idx = xyIdx(x, _y);
    map[idx] = type;
  }
};

// only look at cardinal directions as corner tiles don't affect the center tile
export const getNeighborScores = (map: Map): number[] => {
  return map
    // discard tiles that are not visible
    .map((_s, idx, scores) => {
      let total = 0;
      const [x, y] = [idx % MAPWIDTH, ~~(idx / MAPWIDTH)];

      const NIdx = xyIdx(x, y - 1);
      const EIdx = xyIdx(x + 1, y);
      const SIdx = xyIdx(x, y + 1);
      const WIdx = xyIdx(x - 1, y);
      const NWIdx = xyIdx(x - 1, y - 1);
      const NEIdx = xyIdx(x + 1, y - 1);
      const SEIdx = xyIdx(x + 1, y + 1);
      const SWIdx = xyIdx(x - 1, y + 1);
      const neighbors = {
        N: !!(NIdx >= 0 && NIdx < map.length && scores[NIdx]),
        E: !!(EIdx >= 0 && EIdx < map.length && scores[EIdx]),
        S: !!(SIdx >= 0 && SIdx < map.length && scores[SIdx]),
        W: !!(WIdx >= 0 && WIdx < map.length && scores[WIdx]),
        NW: !!(NWIdx >= 0 && NWIdx < map.length && scores[NWIdx]),
        NE: !!(NEIdx >= 0 && NEIdx < map.length && scores[NEIdx]),
        SE: !!(SEIdx >= 0 && SEIdx < map.length && scores[SEIdx]),
        SW: !!(SWIdx >= 0 && SWIdx < map.length && scores[SWIdx])
      };

      if (neighbors.N) {
        total += 2;
      }
      if (neighbors.E) {
        total += 16;
      }
      if (neighbors.S) {
        total += 64;
      }
      if (neighbors.W) {
        total += 8;
      }
      if (neighbors.NW && neighbors.W && neighbors.N) {
        total += 1;
      }
      if (neighbors.NE && neighbors.N && neighbors.E) {
        total += 4;
      }
      if (neighbors.SE && neighbors.E && neighbors.S) {
        total += 128;
      }
      if (neighbors.SW && neighbors.S && neighbors.W) {
        total += 32;
      }

      return total;
    });
};

/**
 * applyCellularAutomataToArea
 *
 * @param {Map} map   input map
 * @param {number} x  area's x coordinate
 * @param {number} y  area's y coordinate
 * @param {number} w  area's width
 * @param {number} h  area's height
 * @param {} params   parameters to tweak the cellular automaton
 * @returns {Map}     output map
 */
const applyCellularAutomataToArea = (
  map: Map,
  x: number,
  y: number,
  w: number,
  h: number,
  params: {
    alive: number;
    dead: number;
    iterations: number;
  } = {
    alive: CA_ALIVE,
    dead: CA_DEAD,
    iterations: CA_ITER
  }
): Map => {
  const initial = (new Array(map.length)).fill(null);
  for (let _x = x; _x < x + w; _x++) {
    for (let _y = y; _y < y + h; _y++) {
      const idx = xyIdx(_x, _y);
      if (idx > MAPWIDTH * MAPHEIGHT) { continue; }
      initial[idx] = map[idx];
    }
  }
  const simulateCells = (cells: number[]): number[] => {
    const out = [...cells];
    for (let i = 0; i < cells.length; i++) {
      const cellX = i % MAPWIDTH;
      const cellY = ~~(i / MAPWIDTH);
      let count = 0;
      for (let _x = -1; _x <= 1; _x++) {
        for (let _y = -1; _y <= 1; _y++) {
          if (_x === 0 && _y === 0) { continue; }
          const nIdx = xyIdx(cellX + _x, cellY + _y);
          if (nIdx < 0 || nIdx >= cells.length) { continue; }
          count += cells[nIdx];
        }
      }
      if (cells[i] === 0) {
        out[i] = count < params.dead ? 1 : 0;
      } else if (cells[i] === 1) {
        out[i] = count > params.alive ? 0 : 1;
      }
    }
    return out;
  };

  let cells = initial.slice(0);
  for (let i = 0; i < params.iterations; i++) {
    cells = simulateCells(cells);
  }

  const out = map.slice(0);
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] != null) {
      out[i] = cells[i];
    }
  }
  return out;
};

export const createMap = (w: number, h: number): {
  map: Map;
  rooms: number[][];
  centers: number[][];
  scores: number[];
} => {
  const map = (new Array(w * h)).fill(CellType.WALL);

  for (let y = 0; y < MAPHEIGHT; y++) {
    for (let x = 0; x < MAPWIDTH; x++) {
      map[xyIdx(x, y)] = CellType.WALL;
    }
  }

  // create random rooms
  const rooms: Rect[] = [];
  const nRooms = ROT.RNG.getUniformInt(MIN_ROOMS, MAX_ROOMS);
  let i = 0;
  while (rooms.length < nRooms || i++ > 300) {
    const width = ROT.RNG.getUniformInt(MIN_SIZE, MAX_SIZE);
    const height = ROT.RNG.getUniformInt(MIN_SIZE, MAX_SIZE);
    const x = ROT.RNG.getUniformInt(1, MAPWIDTH - 1 - MAX_SIZE);
    const y = ROT.RNG.getUniformInt(1, MAPHEIGHT - 1 - MAX_SIZE);
    const room: Rect = [x, y, width, height];
    if (rooms.length === 0) {
      rooms.push(room);
    } else {
      let ok = true;
      rooms.forEach(other => {
        if (overlaps(room, other)) { ok = false; }
      });
      if (ok) {
        rooms.push(room);
      }
    }
  }

  rooms.forEach(([x, y, width, height]) => fillSquare(map, x, y, width, height, CellType.FLOOR));
  const centers = rooms.map(getCenter);

  let finalMap = map.slice(0);
  for (const center of centers) {
    const [cx, cy] = center;
    const hpad = ROT.RNG.getUniformInt(MIN_SIZE, MAX_SIZE);
    const vpad = ROT.RNG.getUniformInt(MIN_SIZE, MAX_SIZE);
    const x = cx - hpad;
    const y = cy - vpad;
    const w = hpad * 2;
    const h = vpad * 2;
    finalMap = applyCellularAutomataToArea(finalMap, x, y, w, h);
  }

  centers.sort((a, b) => {
    return b[0] + b[1] - a[0] - a[1];
  }).forEach((center, idx) => {
    if (idx === centers.length - 1) { return; }
    const c1 = center;
    const c2 = centers[idx + 1];
    const turns = [[c1[0], c2[1]], [c2[0], c1[1]]];
    const turn = ROT.RNG.getItem(turns);

    if (c1[0] === turn[0]) {
      drawVerticalLine(finalMap, c1[1], turn[1], turn[0]);
      drawHorizontalLine(finalMap, c2[0], turn[0], turn[1]);
    } else {
      drawHorizontalLine(finalMap, c1[0], turn[0], turn[1]);
      drawVerticalLine(finalMap, c2[1], turn[1], turn[0]);
    }
  });

  drawVerticalLine(finalMap, 0, MAPHEIGHT-1, 0, CellType.WALL);
  drawVerticalLine(finalMap, 0, MAPHEIGHT-1, MAPWIDTH-1, CellType.WALL);
  drawHorizontalLine(finalMap, 0, MAPWIDTH-1, 0, CellType.WALL);
  drawHorizontalLine(finalMap, 0, MAPWIDTH-1, MAPHEIGHT-1, CellType.WALL);

  return {map: finalMap, rooms, centers, scores: getNeighborScores(finalMap)};
};
