import {RNG, Noise} from 'rot-js';
import isEqual from 'lodash/isEqual';
import { TILEWIDTH, TILEHEIGHT, MAPWIDTH, MAPHEIGHT } from '.';
import { applyRoomTemplate, RoomType, createRoomTemplate } from './mapgen/roomTemplates';
import { MapGen, MapGenResult } from './mapgen';
import { matchNeighborScore } from './utils/map';

// Map generation parameters
const MIN_SIZE = 3;
const MAX_SIZE = 8;
const MAX_ROOMS = 20;
const MIN_ROOMS = 10;
const DOOR_CHANCE = 0.5;
const CA_ALIVE = 4;
const CA_DEAD = 5;
const CA_ITER = 5;

export type Rect = [number, number, number, number];

export enum CellType {
  FLOOR,
  WALL,
  DOOR_OPEN,
  DOOR_CLOSED,
  DOOR_LOCKED,
  GRASS,
  GRASSY_WALL,
}

export type Map = CellType[];

export const xyIdx = (x: number, y: number, W: number = MAPWIDTH): number => y * W + x;

export const lightPasses = (map: Map, idx: number): boolean => {
  return !!(idx >= 0 && idx < map.length && [
    CellType.DOOR_OPEN,
    CellType.FLOOR,
    CellType.GRASS
  ].includes(map[idx]));
};

export const isPassable = (map: Map, idx: number): boolean => {
  return !!(idx >= 0 && idx < map.length && [
    CellType.DOOR_OPEN,
    CellType.FLOOR,
    CellType.GRASS
  ].includes(map[idx]));
};

const fillSquare = (map: Map, x: number, y: number, w: number, h: number, type: CellType = CellType.FLOOR): void => {
  for (let _x = x; _x < x + w; _x++) {
    for (let _y = y; _y < y + h; _y++) {
      const idx = xyIdx(_x, _y);
      if (idx < 0 || idx >= MAPWIDTH * MAPHEIGHT) { continue; }
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

export const drawHorizontalLine = (
  map: Map,
  x1: number,
  x2: number,
  y: number,
  type: CellType = CellType.FLOOR,
  W: number = MAPWIDTH,
): void => {
  for (let _x = Math.min(x1, x2); _x <= Math.max(x1, x2); _x++) {
    const idx = xyIdx(_x, y, W);
    map[idx] = type;
  }
};

export const drawVerticalLine = (
  map: Map,
  y1: number,
  y2: number,
  x: number,
  type: CellType = CellType.FLOOR,
  W: number = MAPWIDTH,
): void => {
  for (let _y = Math.min(y1, y2); _y <= Math.max(y1, y2); _y++) {
    const idx = xyIdx(x, _y, W);
    map[idx] = type;
  }
};

export const getNeighborScores = (map: Map): number[] => {
  return map
    .map((_s, idx, scores) => {
      const floorTiles = [
        CellType.FLOOR,
        CellType.GRASS
      ];
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
        N: !!(NIdx >= 0 && NIdx < map.length && !floorTiles.includes(scores[NIdx])),
        E: !!(EIdx >= 0 && EIdx < map.length && !floorTiles.includes(scores[EIdx])),
        S: !!(SIdx >= 0 && SIdx < map.length && !floorTiles.includes(scores[SIdx])),
        W: !!(WIdx >= 0 && WIdx < map.length && !floorTiles.includes(scores[WIdx])),
        NW: !!(NWIdx >= 0 && NWIdx < map.length && !floorTiles.includes(scores[NWIdx])),
        NE: !!(NEIdx >= 0 && NEIdx < map.length && !floorTiles.includes(scores[NEIdx])),
        SE: !!(SEIdx >= 0 && SEIdx < map.length && !floorTiles.includes(scores[SEIdx])),
        SW: !!(SWIdx >= 0 && SWIdx < map.length && !floorTiles.includes(scores[SWIdx]))
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
      if (neighbors.NW) {
        total += 1;
      }
      if (neighbors.NE) {
        total += 4;
      }
      if (neighbors.SE) {
        total += 128;
      }
      if (neighbors.SW) {
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
export const applyCellularAutomataToArea = (
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
      // a tile becomes a wall if it was a wall and 4 or more of its eight neighbors were walls, or if it was not a wall and 5 or more neighbors were.
      if (cells[i] === CellType.FLOOR) {
        out[i] = count <= params.dead ? CellType.FLOOR : CellType.WALL;
      } else if (cells[i] === CellType.WALL) {
        out[i] = count >= params.alive ? CellType.WALL : CellType.FLOOR;
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

const createRoom = (
  coordinates: [number, number],
  minWidth: number,
  maxWidth: number,
  minHeight: number,
  maxHeight: number
): Rect => {
  const size = [
    RNG.getUniformInt(minWidth, maxWidth),
    RNG.getUniformInt(minHeight, maxHeight),
  ];
  return [coordinates[0] - ~~(size[0] / 2), coordinates[1] - ~~(size[1] / 2), size[0], size[1]];

};

const drawMapBorders = map => {
  drawVerticalLine(map, 0, MAPHEIGHT - 1, 0, CellType.WALL);
  drawVerticalLine(map, 0, MAPHEIGHT - 1, MAPWIDTH - 1, CellType.WALL);
  drawHorizontalLine(map, 0, MAPWIDTH - 1, 0, CellType.WALL);
  drawHorizontalLine(map, 0, MAPWIDTH - 1, MAPHEIGHT - 1, CellType.WALL);
};

export const grassNoise = new Noise.Simplex(8);

export const createNewMap2 = async (w: number, h: number) => {
  const mapGenPromise: Promise<MapGenResult> = new Promise((resolve, reject) => {
    const gen = new MapGen({
      W: w, 
      H: h,
      callback: resolve,
      draw: false
    }, {
        ...MapGen.defaultParams,
        maxRoomSize: 8,
        numRects: 280,
        spawnRadiusVertical: w / 2,
        spawnRadiusHorizontal: h / 2,
        cohesion: 100,
        cohesionCoeff: 0.3,
        separation: 8,
        friction: 0.9,
        seed: 1337 
      });
    gen.generate();
  });

  /*
   *
  * tile width = 8px
  * mapgen output room size = 4px -> 4 tiles
  * viewport width = 64 tiles
  * map width = 64 * 4 tiles = 256 tiles = 2048px
  * */

  const data = await mapGenPromise;
  const map = new Array(w * h).fill(CellType.WALL);
  data.rooms.forEach(r => {
    const x = r.x;
    const y = r.y;
    const w = r.w;
    const h = r.h;
    for (let _x = ~~(x - w/2) ; _x < ~~(x + w/2); _x++) {
      for (let _y = ~~(y - h/2); _y < ~~(y + h/2); _y++) {
        map[xyIdx(_x, _y)] = CellType.FLOOR;
      }
    }
  });
  data.corridors.forEach(c => {
    const [start, end] = c;
    if (start.x === end.x) {
      drawVerticalLine(map, start.y , end.y , start.x , CellType.FLOOR)
    } else {
      drawHorizontalLine(map, start.x, end.x, start.y, CellType.FLOOR)
    }
  });



  const {
    rooms,
    corridors,
    graph
  } = data;

  drawMapBorders(map);

  // generate grass
  for (let idx = 0; idx < map.length; idx++) {
    const x = idx % MAPWIDTH;
    const y = ~~(idx / MAPWIDTH);
    const noise = grassNoise.get(x / 300, y / 300);
    if (noise > 0.25 && noise <= 0.5) {
      if (map[idx] === CellType.FLOOR) {
        map[idx] = CellType.GRASS;
      } else if (map[idx] === CellType.WALL) {
        map[idx] = CellType.GRASSY_WALL;
      }
    }

    if (map[idx] === undefined) {
      map[idx] = CellType.WALL;
    }
  }

  let scores = getNeighborScores(map); 
  let doorCandidates = [];
  const masks = {
    N: '?0?11000',
    E: '01?0001?',
    S: '00011?0?',
    W: '?1000?10',
  };
  for (let idx = 0; idx < map.length; idx++) {
    if (![CellType.FLOOR, CellType.GRASS].includes(map[idx])) {
      continue;
    }

    for (const mask of Object.values(masks)) {
      if (matchNeighborScore(mask)(scores[idx])) {
        doorCandidates.push(idx);
      }
    }
  }
  const DOORS = [CellType.DOOR_OPEN, CellType.DOOR_CLOSED, CellType.DOOR_LOCKED];
  for (let candidate of doorCandidates) {
    if (RNG.getUniformInt(0, 1)) {
      if (
        DOORS.includes(map[candidate-1]) ||
        DOORS.includes(map[candidate+1]) ||
        DOORS.includes(map[candidate-MAPWIDTH]) ||
        DOORS.includes(map[candidate+MAPWIDTH])
      ) {
        continue;
      }
      map[candidate] = RNG.getItem(DOORS.slice(0, 2));
    }
  }
  scores = getNeighborScores(map); 

  return {
    map,
    rooms: data.rooms,
    centers: data.rooms.map(r => [r.x, r.y]),
    scores: scores 
  };

}

export const createNewMap = (w: number, h: number): {
  map: Map;
  rooms: number[][];
  centers: number[][];
  scores: number[];
} => {
  const map = new Array(w * h).fill(CellType.WALL);
  const mapCenter: [number, number] = [
    ~~(w / 2),
    ~~(h / 2)
  ];
  const caCreator = createRoomTemplate(RoomType.CELLULAR_AUTOMATA)
  const initialRoomTemplate = caCreator({
    minWidth: 7,
    maxWidth: 11,
    minHeight: 7,
    maxHeight: 11
  });
  const initialRoom: Rect = [
    mapCenter[0] - initialRoomTemplate[1].centerOffset[0],
    mapCenter[1] - initialRoomTemplate[1].centerOffset[1],
    initialRoomTemplate[1].width,
    initialRoomTemplate[1].height,
  ];
  applyRoomTemplate(map, mapCenter, initialRoomTemplate);
  let prevCenter = mapCenter;
  let centers = [mapCenter];
  let rooms = [initialRoom];
  let tries = 0;
  while (rooms.length < 15 && tries++ < 100) {
    const dirs = {
      's': [0, 10],
      'n': [0, -10],
      'e': [10, 0],
      'w': [-10, 0]
    };
    const dir = RNG.getItem(Object.keys(dirs));
    const offset = dirs[dir];
    const newCenter: [number, number] = [prevCenter[0] + offset[0], prevCenter[1] + offset[1]];
    if (newCenter[0] <= 0 || newCenter[0] > w || newCenter[1] <= 0 || newCenter[1] > h) { continue; }
    const room = createRoom(newCenter, 5, 9, 5, 9);
    let ok = true;
    for (const other of rooms) {
      if (overlaps(room, other)) {
        ok = false;
        break;
      }
    }
    if (ok) {
      fillSquare(map, room[0], room[1], room[2], room[3], CellType.FLOOR);
      if (dir === 'n' || dir === 's') {
        drawVerticalLine(map, prevCenter[1], newCenter[1], prevCenter[0], CellType.FLOOR);
      } else {
        drawHorizontalLine(map, prevCenter[0], newCenter[0], prevCenter[1], CellType.FLOOR);
      }
      centers.push(newCenter);
      rooms.push(room);
      prevCenter = RNG.getItem(centers);
    }
  }

  for (let idx = 0; idx < map.length; idx++) {
    if (typeof map[idx] === 'undefined') {
      map[idx] = CellType.FLOOR;
    }
  }

  drawMapBorders(map);

  // generate grass
  for (let idx = 0; idx < map.length; idx++) {
    if (map[idx] === CellType.FLOOR) {
      const x = idx % MAPWIDTH;
      const y = ~~(idx / MAPWIDTH);
      if (grassNoise.get(x / 10, y / 10) > 0.25) {
        map[idx] = CellType.GRASS;
      }
    }
  }

  return {
    map,
    rooms,
    centers,
    scores: getNeighborScores(map)
  };
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
  const nRooms = RNG.getUniformInt(MIN_ROOMS, MAX_ROOMS);
  let i = 0;
  while (rooms.length < nRooms || i++ > 300) {
    const width = RNG.getUniformInt(MIN_SIZE, MAX_SIZE);
    const height = RNG.getUniformInt(MIN_SIZE, MAX_SIZE);
    const x = RNG.getUniformInt(1, MAPWIDTH - 1 - MAX_SIZE);
    const y = RNG.getUniformInt(1, MAPHEIGHT - 1 - MAX_SIZE);
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
    const hpad = RNG.getUniformInt(MIN_SIZE, MAX_SIZE);
    const vpad = RNG.getUniformInt(MIN_SIZE, MAX_SIZE);
    const x = cx - hpad;
    const y = cy - vpad;
    const w = hpad * 2;
    const h = vpad * 2;
    finalMap = applyCellularAutomataToArea(finalMap, x, y, w, h);
  }

  const doors = [];
  centers.sort((a, b) => {
    return b[0] + b[1] - a[0] - a[1];
  }).forEach((center, idx) => {
    if (idx === centers.length - 1) { return; }
    const c1 = center;
    const c2 = centers[idx + 1];
    const turns = [[c1[0], c2[1]], [c2[0], c1[1]]];
    const turn = RNG.getItem(turns);

    const room = rooms.find(r => isEqual(getCenter(r), c1));

    let possibleDoorLocation: [number, number];

    if (c1[0] === turn[0]) { // if on same Y axis as center
      if (c1[1] > turn[1]) { // below the center
        possibleDoorLocation = [c1[0], c1[1] - ~~(room[3]/2) - 1];
      } else { // above the center
        possibleDoorLocation = [c1[0], c1[1] + ~~(room[3]/2) + 1];
      }
    } else { // on same X axis as center
      if (c1[0] > turn[0]) { // left of center
        possibleDoorLocation = [c1[0] - ~~(room[2]/2) - 1, c1[1]];
      } else { // right of center
        possibleDoorLocation = [c1[0] + ~~(room[2]/2) + 1, c1[1]];
      }
    }

    const type = RNG.getItem([CellType.DOOR_OPEN, CellType.DOOR_CLOSED]);
    doors.push([possibleDoorLocation, type]);

    if (c1[0] === turn[0]) {
      drawVerticalLine(finalMap, c1[1], turn[1], turn[0]);
      drawHorizontalLine(finalMap, c2[0], turn[0], turn[1]);
    } else {
      drawHorizontalLine(finalMap, c1[0], turn[0], turn[1]);
      drawVerticalLine(finalMap, c2[1], turn[1], turn[0]);
    }

    for (const [loc, type] of doors) {
      if (RNG.getUniform() < DOOR_CHANCE) {
        const idx = xyIdx(loc[0], loc[1]);
        finalMap[idx] = type;
      }
    }
  });

  drawVerticalLine(finalMap, 0, MAPHEIGHT-1, 0, CellType.WALL);
  drawVerticalLine(finalMap, 0, MAPHEIGHT-1, MAPWIDTH-1, CellType.WALL);
  drawHorizontalLine(finalMap, 0, MAPWIDTH-1, 0, CellType.WALL);
  drawHorizontalLine(finalMap, 0, MAPWIDTH-1, MAPHEIGHT-1, CellType.WALL);

  // generate grass
  for (let idx = 0; idx < finalMap.length; idx++) {
    if (finalMap[idx] === CellType.FLOOR) {
      const x = idx % MAPWIDTH;
      const y = ~~(idx / MAPWIDTH);
      if (grassNoise.get(x / 100, y / 100) > 0.25) {
        finalMap[idx] = CellType.GRASS;
      }
    }
  }
  return {map: finalMap, rooms, centers, scores: getNeighborScores(finalMap)};
};
