import {RNG} from 'rot-js';
import {
  CellType,
  applyCellularAutomataToArea,
  drawVerticalLine,
  drawHorizontalLine,
  xyIdx,
  Map
} from '../map';

export type XYCoordinates = [number, number];

export enum RoomType {
  CELLULAR_AUTOMATA,
  SQUARE,
  OVERLAPPING_SQUARES,
  CORRIDOR_H,
  CORRIDOR_V
}

export type RoomGenParams = {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export type RoomTemplate = number[];

export type RoomTemplateMetainfo = {
  centerOffset: XYCoordinates;
  doorCandidates: XYCoordinates[];
  width: number;
  height: number;
}

export type RoomTemplateResult = [
  RoomTemplate,
  RoomTemplateMetainfo
];

export const createCARoomTemplate = (params: RoomGenParams): RoomTemplateResult => {
  const { minWidth, maxWidth, minHeight, maxHeight } = params;
  const W = RNG.getUniformInt(minWidth, maxWidth);
  const H = RNG.getUniformInt(minHeight, maxHeight);
  const cells = (new Array(W * H).fill(CellType.WALL));
  const centerOffset: XYCoordinates = [~~(W/2), ~~(H/2)];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (RNG.getUniform() <= 0.55) {
        cells[y * W + x] = CellType.FLOOR;
      }
    }
  }

  applyCellularAutomataToArea(cells, 0, 0, W, H, {
    dead: 5,
    alive: 4,
    iterations: 15,
  });

  drawVerticalLine(cells, 0, H - 1, 0, CellType.WALL, W);
  drawVerticalLine(cells, 0, H - 1, W - 1, CellType.WALL, W);
  drawHorizontalLine(cells, 0, W - 1, 0, CellType.WALL, W);
  drawHorizontalLine(cells, 0, W - 1, H - 1, CellType.WALL, W);

  const doorCandidates: XYCoordinates[] = [
    [0, centerOffset[1]],
    [W - 1, centerOffset[1]],
    [centerOffset[0], 0],
    [centerOffset[0], H - 1]
  ];

  return [
    cells,
    {
      centerOffset,
      doorCandidates,
      width: W,
      height: H
    }
  ];
};

export const createSquareRoomTemplate = (params: RoomGenParams): RoomTemplateResult => {
  const { minWidth, maxWidth, minHeight, maxHeight } = params;
  const W = RNG.getUniformInt(minWidth, maxWidth);
  const H = RNG.getUniformInt(minHeight, maxHeight);
  const cells = (new Array(W * H).fill(CellType.WALL));
  const centerOffset: XYCoordinates = [~~(W/2), ~~(H/2)];

  for (let x = 1; x < W - 1; x++) {
    for (let y = 1; y < H - 1; y++) {
      cells[y * W + x] = CellType.FLOOR;
    }
  }

  const doorCandidates: XYCoordinates[] = [
    [0, centerOffset[1]],
    [W - 1, centerOffset[1]],
    [centerOffset[0], 0],
    [centerOffset[0], H - 1]
  ];


  return [
    cells,
    {
      centerOffset,
      doorCandidates,
      width: W,
      height: H
    }
  ];
};

export const createOverlappingSquareRoomTemplate = (params: RoomGenParams): RoomTemplateResult => {
  const { minWidth, maxWidth, minHeight, maxHeight } = params;
  const W = RNG.getUniformInt(minWidth, maxWidth);
  const H = RNG.getUniformInt(minHeight, maxHeight);
  const cells = (new Array(W * H).fill(CellType.WALL));
  const centerOffset: XYCoordinates = [~~(W/2), ~~(H/2)];

  for (let x = 1; x < W - 1; x++) {
    for (let y = 1; y < H - 1; y++) {
      cells[y * W + x] = CellType.FLOOR;
    }
  }
  const w1 = RNG.getUniformInt(3, W-2);
  const h1 = RNG.getUniformInt(3, H-2);
  const origin1 = [~~((W - w1)/2), ~~((H - h1)/2)];
  for (let x = 0; x < w1; x++) {
    for (let y = 0; y < h1; y++) {
      const [ X, Y ] = origin1;
      const idx = (Y + y) * H + X + x;
      cells[idx] = CellType.FLOOR;
    }
  }

  const w2 = RNG.getUniformInt(3, W-2);
  const h2 = RNG.getUniformInt(3, H-2);
  const origin2 = [~~((W - w2)/2), ~~((H - h2)/2)];
  for (let x = 0; x < w2; x++) {
    for (let y = 0; y < h2; y++) {
      const [ X, Y ] = origin2;
      const idx = (Y + y) * H + X + x;
      cells[idx] = CellType.FLOOR;
    }
  }


  drawVerticalLine(cells, 0, H - 1, 0, CellType.WALL, W);
  drawVerticalLine(cells, 0, H - 1, W - 1, CellType.WALL, W);
  drawHorizontalLine(cells, 0, W - 1, 0, CellType.WALL, W);
  drawHorizontalLine(cells, 0, W - 1, H - 1, CellType.WALL, W);


  const doorCandidates: XYCoordinates[] = [
    [0, centerOffset[1]],
    [W - 1, centerOffset[1]],
    [centerOffset[0], 0],
    [centerOffset[0], H - 1]
  ];


  return [
    cells,
    {
      centerOffset,
      doorCandidates,
      width: W,
      height: H
    }
  ];
};

export const createCorridorTemplate = (type: RoomType.CORRIDOR_H | RoomType.CORRIDOR_V) => (params: RoomGenParams): RoomTemplateResult => {
  const { minWidth, maxWidth, minHeight, maxHeight } = params;
  let W, H;
  if (type === RoomType.CORRIDOR_H) {
    W = RNG.getUniformInt(minWidth, maxWidth);
    H = 1;
  } else {
    W = 1;
    H = RNG.getUniformInt(minHeight, maxHeight);
  }
  const cells = (new Array(W * H).fill(CellType.WALL));
  const centerOffset: XYCoordinates = [~~(W/2), ~~(H/2)];

  const doorCandidates: XYCoordinates[] = [
    [0, centerOffset[1]],
    [W - 1, centerOffset[1]],
    [centerOffset[0], 0],
    [centerOffset[0], H - 1]
  ];


  return [
    cells,
    {
      centerOffset,
      doorCandidates,
      width: W,
      height: H
    }
  ];
};

export const applyRoomTemplate = (map: Map, coordinates: XYCoordinates, template: RoomTemplateResult): void => {
  const [ cells, meta ] = template;
  for (let idx = 0; idx < cells.length; idx++) {
    const _x = idx % meta.width;
    const _y = ~~(idx / meta.width);
    const x = coordinates[0] + _x - meta.centerOffset[0];
    const y = coordinates[1] + _y - meta.centerOffset[1];
    const cell = cells[idx];

    map[xyIdx(x, y)] = cell;
  }
};


export const createRoomTemplate = (type: RoomType) => (params: RoomGenParams): RoomTemplateResult => {
  if (type === RoomType.CELLULAR_AUTOMATA) {
    return createCARoomTemplate(params);
  } else if (type === RoomType.SQUARE) {
    return createSquareRoomTemplate(params);
  } else if (type === RoomType.OVERLAPPING_SQUARES) {
    return createOverlappingSquareRoomTemplate(params);
  } else if (type === RoomType.CORRIDOR_H) {
    return createCorridorTemplate(type)(params);
  } else if (type === RoomType.CORRIDOR_V) {
    return createCorridorTemplate(type)(params);
  }
};
