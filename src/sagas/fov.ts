import * as ROT from 'rot-js';

import { put, select } from 'redux-saga/effects';
import { CELL_PROPERTIES } from '../cells';
import { ENTITY_TYPES } from '../entities';
import { cellKey } from '../utils/map';

import { GameState } from '../types';

let fov;
let lighting;

export function* calculateLighting() {
  const state = yield select();
  const { map, entities } = (state as GameState);
  const player = Object.values(entities).filter(e => e.type === ENTITY_TYPES.PLAYER)[0];
  if (!player) { return; }
  const lightPasses = (x, y) => {
    const key = cellKey(x, y);
    const cell = map[key];
    return cell && !CELL_PROPERTIES[cell.type].solid;
  };
  const reflectivity = (x, y) => {
    const key = cellKey(x, y);
    const cell = map[key];
    return CELL_PROPERTIES[cell.type].solid ? 0 : 0.1;
  };
  let fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology: 4});
  let lighting = new ROT.Lighting(reflectivity, { range: 8, passes: 2});
  lighting.clearLights();
  lighting.setFOV(fov);
  lighting.setLight(player.x, player.y, [240, 240, 200]);

  const lightingMap = {};

  lighting.compute((x, y, color) => {
    lightingMap[cellKey(x, y)] = color;
  });

  yield put({ type: 'UPDATE_LIGHTING_MAP', payload: { lightingMap } })
}

export function* calculateFOV(action) {
  const state = yield select();
  const { map, entities } = (state as GameState);
  const player = Object.values(entities).filter(e => e.type === ENTITY_TYPES.PLAYER)[0];
  if (!player) { return; }
  const lightPasses = (x, y) => {
    const key = cellKey(x, y);
    const cell = map[key];
    return cell && !CELL_PROPERTIES[cell.type].solid;
  }
  let fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology: 4});

  const visibilityMap = {};
  const explorationMap = [];

  fov.compute(player.x, player.y, 12, (x, y, r, visibility) => {
    visibilityMap[cellKey(x, y)] = [visibility, undefined];
    explorationMap.push(cellKey(x, y));
  });

  yield put({ type: 'UPDATE_VISIBILITY_MAP', payload: { visibilityMap } });
  yield put({ type: 'UPDATE_EXPLORATION_MAP', payload: { explorationMap } });

  yield calculateLighting();
}
