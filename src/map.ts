import * as ROT from 'rot-js';
import { WIDTH, HEIGHT } from '.';

export enum CellType {
  FLOOR,
  WALL
}

export type Map = CellType[];

export const xyIdx = (x: number, y: number): number => y * WIDTH + x;

export const lightPasses = (map, idx) => {
  return map[idx] && map[idx] === CellType.WALL;
};

export const isBlocked = (map, idx) => {
  return map[idx] && map[idx] === CellType.WALL;
};

const fillSquare = (map, x, y, w, h, type) => {
  for (let _x = x; _x < x + w; _x++) {
    for (let _y = y; _y < y + h; _y++) {
      const idx = xyIdx(_x, _y);
      map[idx] = type;
    }
  }
}

const overlaps = (rect1, rect2) => {
  const [rect1x, rect1y, rect1w, rect1h] = rect1;
  const [rect2x, rect2y, rect2w, rect2h] = rect2;

  return rect1x <= rect2x + rect2w && rect1x + rect1w >= rect2x && rect1y <= rect2y + rect2h && rect1y + rect1h >= rect2y;
}

const getCenter = (rect) => {
  const [x, y, w, h] = rect;

  return [~~((x + x + w)/2), ~~((y + y + h)/2)];
}

const drawHorizontalLine = (map, x1, x2, y, type = CellType.FLOOR) => {
  for (let _x = Math.min(x1, x2); _x <= Math.max(x1, x2); _x++) {
    const idx = xyIdx(_x, y);
    map[idx] = type;
  }
}

const drawVerticalLine = (map, y1, y2, x, type = CellType.FLOOR) => {
  for (let _y = Math.min(y1, y2); _y <= Math.max(y1, y2); _y++) {
    const idx = xyIdx(x, _y);
    map[idx] = type;
  }
}

export const createMap = (w: number, h: number): {
  map: Map;
  rooms: number[][];
  centers: number[][];
} => {
  const map = (new Array(w * h)).fill(CellType.WALL);

  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      map[xyIdx(x, y)] = CellType.WALL;
    }
  }

  const MIN_SIZE = 6;
  const MAX_SIZE = 10;
  // create random rooms
  let rooms = [];
  const nRooms = ROT.RNG.getUniformInt(4, 10);
  while(rooms.length < nRooms) {
    const width = ROT.RNG.getUniformInt(MIN_SIZE, MAX_SIZE);
    const height = ROT.RNG.getUniformInt(MIN_SIZE, MAX_SIZE);
    const x = ROT.RNG.getUniformInt(1, WIDTH - 1 - MAX_SIZE);
    const y = ROT.RNG.getUniformInt(1, HEIGHT - 1 - MAX_SIZE);
    const room = [x, y, width, height];
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
  centers.forEach((center, idx) => {
    if (idx === centers.length - 1) { return; }
    const c1 = center;
    const c2 = centers[idx + 1];
    const turns = [[c1[0], c2[1]], [c2[0], c1[1]]];
    const turn = ROT.RNG.getItem(turns);

    if (c1[0] === turn[0]) {
      drawVerticalLine(map, c1[1], turn[1], turn[0]);
      drawHorizontalLine(map, c2[0], turn[0], turn[1]);
    } else {
      drawHorizontalLine(map, c1[0], turn[0], turn[1]);
      drawVerticalLine(map, c2[1], turn[1], turn[0]);
    }
  })

  return {map, rooms, centers};
};

