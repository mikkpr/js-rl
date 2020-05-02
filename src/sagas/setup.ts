import * as ROT from 'rot-js';
import { put, select } from 'redux-saga/effects';

import { CELL_TYPES } from '../cells';
import { GLYPH_TYPES } from '../glyphs';
import { generateMap } from '../map';
import { createEntity, ENTITY_TYPES } from '../entities';
import { createExit } from '../map';
import { WIDTH, HEIGHT, BOTTOM_PANEL_HEIGHT } from '../index';
import { getAdjacentCells, fillRect, cellKey } from '../utils/map';
import { ID } from '../utils/id';
import { createItem } from '../items';

import { Entity, Item, GameState, Cell } from '../types';

export function* beginSetup(action): Generator {
  const { WORLD_WIDTH, WORLD_HEIGHT } = action.payload;
  yield put({ type: 'DO_SETUP_MAP', payload: { WORLD_WIDTH, WORLD_HEIGHT} });
}

function* placeDoors(cells: Cell[]): Generator {
  const state = yield select();
  const { map } = (state as GameState);

  const floorCells = cells.filter(c => c.type === CELL_TYPES.FLOOR);
  const doorCandidates = [];

  let i = 0;
  let searching = true;
  while (searching) {
    const randomFloorCell = ROT.RNG.getItem(floorCells);
    const adjacentCells = getAdjacentCells(map, randomFloorCell);
    const { n, e, s, w } = adjacentCells;

    if (
      n && (n.type === CELL_TYPES.WALL) &&
      s && (s.type === CELL_TYPES.WALL) &&
      w && (w.type === CELL_TYPES.FLOOR) &&
      e && (e.type === CELL_TYPES.FLOOR)
    ) {
      doorCandidates.push(randomFloorCell);
    } else if (
      w && (w.type === CELL_TYPES.WALL) &&
      e && (e.type === CELL_TYPES.WALL) &&
      n && (n.type === CELL_TYPES.FLOOR) &&
      s && (s.type === CELL_TYPES.FLOOR)
    ) {
      doorCandidates.push(randomFloorCell);
    }

    if (doorCandidates.length > 10 || ++i > 1000) {
      searching = false;
    }
  }

  const candidates = [];
  doorCandidates
    .map(c => cellKey(c.x, c.y))
    .filter((c, idx, cand) => {
      const adjacents = Object.values(getAdjacentCells(map, doorCandidates[idx])).filter(x => x).map((c: Cell) => cellKey(c.x, c.y));
      return adjacents.reduce((acc, adj) => {
        return acc && !cand.includes(adj);
      }, true);
    })
    .map(c => ({
      ...map[c],
      type: ROT.RNG.getItem([CELL_TYPES.DOOR_CLOSED, CELL_TYPES.PORTCULLIS_CLOSED])
    }))
    .forEach(c => candidates.push(c));

  return candidates;
}

function placeExit(cells, WORLD_WIDTH, WORLD_HEIGHT): Cell {
  const grid = {};
  for (const cell of cells) {
    const key = cellKey(cell.x, cell.y) ;
    grid[key] = cell;
  }

  /*
   * [ 1 ] [ 2 ] [ 4 ]
   * [128] [ O ] [ 8 ]
   * [ 64] [ 32] [ 16]
   */
  const validValues = [2, 8, 32, 128, 13, 6, 12, 24, 48, 96, 129, 192, 7, 28, 112, 193];
  const bitmask: [number, [number, number]][] = [
    [  1, [-1, -1]],
    [  2, [ 0, -1]],
    [  4, [ 1, -1]],
    [  8, [ 1,  0]],
    [ 16, [ 1,  1]],
    [ 32, [ 0,  1]],
    [ 64, [-1,  1]],
    [128, [-1,  0]]
  ];
  const scores: number[] = [];
  for (let i = 0; i < WORLD_WIDTH * WORLD_HEIGHT; i++) {
    scores.push(0);
  }

  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const cell = grid[cellKey(x, y)];
      if (cell && cell.type === CELL_TYPES.FLOOR) {
        for (const mask of bitmask) {
          const [score, vec] = mask;
          const [dx, dy] = vec;
          const tx = x + dx;
          const ty = y + dy;
          if ((tx >= 0) && (tx < WORLD_WIDTH) && (ty >= 0) && (ty < WORLD_HEIGHT)) {
            scores[ty * WORLD_WIDTH + tx] += score;
          }
        }
      }
    }
  }

  const doorCandidates = scores.map((s, idx) => {
    const [x, y] = [idx % WORLD_WIDTH, ~~(idx / WORLD_WIDTH)];
    if (validValues.includes(s) && ((x === 0 || x === WORLD_WIDTH - 1) || (y === 0 || y === WORLD_HEIGHT - 1))) {
      return grid[cellKey(x, y)];
    }

    return null;
  }).filter(x => x);

  return ROT.RNG.getItem<Cell>(doorCandidates);
}

export function* setupMap(action): Generator {
  const { WORLD_WIDTH, WORLD_HEIGHT } = action.payload;

  //const cells = fillRect(0, 0, WORLD_WIDTH - 1, WORLD_HEIGHT - 1, CELL_TYPES.WALL);
  const map = generateMap(WORLD_WIDTH, WORLD_HEIGHT);
  const cells = map;
  const{
    minX, minY, maxX, maxY
  } = Object.values(map).reduce((acc, cell) => {
    const { x, y } = cell;

    if (x < acc.minX) { acc.minX = x; }
    if (y < acc.minY) { acc.minY = y; }
    if (x > acc.maxX) { acc.maxX = x; }
    if (x > acc.maxY) { acc.maxY = y; }

    return acc;
  }, {maxX: 0, maxY: 0, minX: 0, minY: 0});

  console.log(minX, minY, maxX, maxY);
  //const map = new ROT.Map.Cellular(WORLD_WIDTH, WORLD_HEIGHT);

  // map.randomize(0.5);
  // for (let i = 0; i <= 2; i++) {
  //   map.create();
  // }
  // map.create((x, y, value) => {
  //   cells.push({ x, y, type: !value ? CELL_TYPES.WALL : CELL_TYPES.FLOOR, contents: [] });
  // });
  // map.connect((x, y, value) => {
  //   cells.push({ x, y, type: !value ? CELL_TYPES.WALL : CELL_TYPES.FLOOR, contents: [] });
  // }, 1);
  for (let x = minX - 1; x <= maxX + 1; x++) {
    cells.push({ x, y: minY - 1, type: CELL_TYPES.WALL, contents: [], flags: [] });
    cells.push({ x, y: maxY + 1, type: CELL_TYPES.WALL, contents: [], flags: [] });
  }
  for (let y = minY - 1; y <= maxY + 1; y++) {
    cells.push({ x: minX - 1, y, type: CELL_TYPES.WALL, contents: [], flags: [] });
    cells.push({ x: maxX + 1, y, type: CELL_TYPES.WALL, contents: [], flags: [] });
  }

  yield put({ type: 'UPDATE_CELLS', payload: { cells } });

  const doors = yield placeDoors(cells);

  yield put({ type: 'UPDATE_CELLS', payload: { cells: doors } });

  const exit = placeExit(cells, WORLD_WIDTH, WORLD_HEIGHT);
  yield put({ type: 'UPDATE_CELL', payload: { cell: Object.assign({}, exit, { type: CELL_TYPES.DOOR_CLOSED, contents: [], flags: ['LOCKED:NONE']}) } });


  yield put({ type: 'DO_SETUP_ZONES', payload: {} });
}

export function* setupZones(): Generator {
  const state = yield select();
  const { map, playerID } = (state as GameState);

  const exit = Object.values(map).filter(c => c.flags.filter(f => f.startsWith('LOCKED:')).length > 0)[0];

  const exitZone = createExit({ playerID })({ src: exit });

  yield put({ type: 'UPDATE_ZONE', payload: { zone: exitZone, id: ID() } });

  yield put({ type: 'DO_SETUP_ENTITIES', payload: {} });
}

export function* setupEntities(): Generator {
  const state = yield select();
  const { map } = (state as GameState);

  const floorCells = Object.values(map).filter(c => c.type === CELL_TYPES.FLOOR);


  const entities: Entity[] = [];

  const { x, y } = ROT.RNG.getItem(floorCells);
  const player = createEntity({
    x,
    y,
    glyph: GLYPH_TYPES.PLAYER,
    type: ENTITY_TYPES.PLAYER,
    inventory: []
  });
  entities.push(player);
  yield put({ type: 'UPDATE_ENTITIES', payload: { entities } });

  const cameraInitialPos = { x: WIDTH / 2 - x, y: (HEIGHT - BOTTOM_PANEL_HEIGHT) / 2 - y };
  yield put({ type: 'UPDATE_CAMERA_POSITION', payload: { x: cameraInitialPos.x, y: cameraInitialPos.y } });

  yield put({ type: 'UPDATE_PLAYER_ID', payload: { id: player.id } });

  yield put({ type: 'DO_SETUP_ITEMS', payload: {} });
}

export function* setupItems(): Generator {
  const state = yield select();
  const { map } = (state as GameState);

  const item = createItem({
    glyph: GLYPH_TYPES.KEY,
    name: 'a key'
  });

  const lockedDoor = Object.values(map).filter(c => c.flags.includes('LOCKED:NONE'))[0];
  if (lockedDoor) {
    yield put({ type: 'UPDATE_CELL', payload: { cell: Object.assign({}, lockedDoor, { flags: ['LOCKED:' + item.id] } ) }});
  }

  yield put({ type: 'CREATE_ITEM', payload: { item } });

  const cell: Cell = ROT.RNG.getItem(Object.values(map).filter(c => c.type === CELL_TYPES.FLOOR));

  yield put({ type: 'UPDATE_CELL', payload: { cell: { ...cell, contents: cell.contents.concat(item.id) } } });

  yield put({ type: 'CALCULATE_FOV', payload: {} });
}
