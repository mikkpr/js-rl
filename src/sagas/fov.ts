import * as ROT from 'rot-js';

import { put, select } from 'redux-saga/effects';
import { CELL_PROPERTIES } from '../cells';
import { ENTITY_TYPES } from '../entities';
import { cellKey } from '../utils/map';

import { GameState } from '../types';

let fov;
export function* calculateFOV(action) {
  const state = yield select();
  const { map, entities } = (state as GameState);
  const player = Object.values(entities).filter(e => e.type === ENTITY_TYPES.PLAYER)[0];
  if (!player) { return; }
  const lightPasses = (x, y) => {
    const key = cellKey(x, y);
    const cell = map[key];
    return !CELL_PROPERTIES[cell.type].solid;
  }
  if (!fov) {
    fov = new ROT.FOV.RecursiveShadowcasting(lightPasses);
  }

  const lightingMap = {};
  const explorationMap = [];

  fov.compute(player.x, player.y, 6, (x, y, r, visibility) => {
    lightingMap[cellKey(x, y)] = visibility;
    explorationMap.push(cellKey(x, y));
  });

  yield put({ type: 'UPDATE_LIGHTING_MAP', payload: { lightingMap } })
  yield put({ type: 'UPDATE_EXPLORATION_MAP', payload: { explorationMap } })
}
