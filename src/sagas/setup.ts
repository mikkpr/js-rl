import * as ROT from 'rot-js';
import { put, select } from 'redux-saga/effects';

import { CELL_TYPES } from '../cells';
import { GLYPH_TYPES } from '../glyphs';
import { createEntity, ENTITY_TYPES } from '../entities';
import { WIDTH, HEIGHT, BOTTOM_PANEL_HEIGHT } from '../index';
import { getAdjacentCells, fillRect, cellKey } from '../utils/map';
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

    if (
      adjacentCells.n.type === CELL_TYPES.WALL &&
      adjacentCells.s.type === CELL_TYPES.WALL &&
      adjacentCells.w.type === CELL_TYPES.FLOOR &&
      adjacentCells.e.type === CELL_TYPES.FLOOR
    ) {
      doorCandidates.push(randomFloorCell);
    } else if (
      adjacentCells.w.type === CELL_TYPES.WALL &&
      adjacentCells.e.type === CELL_TYPES.WALL &&
      adjacentCells.n.type === CELL_TYPES.FLOOR &&
      adjacentCells.s.type === CELL_TYPES.FLOOR
    ) {
      doorCandidates.push(randomFloorCell);
    }

    if (doorCandidates.length > 10 || --i > 1000) {
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
    .map(c => ({ ...map[c], type: CELL_TYPES.DOOR_CLOSED }))
    .forEach(c => candidates.push(c));

  return candidates;
}

export function* setupMap(action): Generator {
  const { WORLD_WIDTH, WORLD_HEIGHT } = action.payload;

  const cells = fillRect(0, 0, WORLD_WIDTH - 1, WORLD_HEIGHT - 1, CELL_TYPES.WALL);
  const map = new ROT.Map.Cellular(WORLD_WIDTH, WORLD_HEIGHT);

  map.randomize(0.5);
  for (let i = 0; i <= 2; i++) {
    map.create();
  }
  map.create((x, y, value) => {
    cells.push({ x, y, type: !value ? CELL_TYPES.WALL : CELL_TYPES.FLOOR, contents: [] });
  });
  map.connect((x, y, value) => {
    cells.push({ x, y, type: !value ? CELL_TYPES.WALL : CELL_TYPES.FLOOR, contents: [] });
  }, 1);
  for (let x = -1; x <= WORLD_WIDTH; x++) {
    cells.push({ x, y: -1, type: CELL_TYPES.WALL, contents: [] });
    cells.push({ x, y: WORLD_HEIGHT, type: CELL_TYPES.WALL, contents: [] });
  }
  for (let y = -1; y < WORLD_HEIGHT; y++) {
    cells.push({ x: -1, y, type: CELL_TYPES.WALL, contents: [] });
    cells.push({ x: WORLD_WIDTH, y, type: CELL_TYPES.WALL, contents: [] });
  }

  yield put({ type: 'UPDATE_CELLS', payload: { cells } });

  const doors = yield placeDoors(cells);

  yield put({ type: 'UPDATE_CELLS', payload: { cells: doors } });

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
  })
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

  yield put({ type: 'CREATE_ITEM', payload: { item } });

  const cell: Cell = ROT.RNG.getItem(Object.values(map).filter(c => c.type === CELL_TYPES.FLOOR));

  yield put({ type: 'UPDATE_CELL', payload: { cell: { ...cell, contents: cell.contents.concat(item.id) } } });

  yield put({ type: 'CALCULATE_FOV', payload: {} });
}
