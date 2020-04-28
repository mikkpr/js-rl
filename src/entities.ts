import * as ROT from 'rot-js';
import { action } from './state';
import { GLYPHS, GLYPH_TYPES } from './glyphs';
import { CELL_TYPES } from './cells';
import { GameState } from './types';

export const ENTITY_TYPES = {
  PLAYER: 'PLAYER',
  FOLIAGE: 'FOLIAGE'
};

export const ENTITY_PROPERTIES = {
  [ENTITY_TYPES.PLAYER]: {
    controllable: true
  }
};

export const setupEntities = ({ WIDTH, HEIGHT, BOTTOM_PANEL_HEIGHT, playerID, game }): void => {
  const state: GameState = game.getState();
  const floorCells = Object.values(state.map).filter(c => c.type === CELL_TYPES.FLOOR);
  const { x, y } = ROT.RNG.getItem(floorCells);
  const playerInitialPos = { x, y };
  const cameraInitialPos = { x: WIDTH / 2 - x, y: (HEIGHT - BOTTOM_PANEL_HEIGHT) / 2 - y }
  const entities = [];
  entities.push({
    ...playerInitialPos,
    glyph: GLYPH_TYPES.PLAYER,
    type: ENTITY_TYPES.PLAYER,
    id: playerID
  });
  action('UPDATE_ENTITIES', { entities });
  action('UPDATE_CAMERA_POSITION', { x: cameraInitialPos.x, y: cameraInitialPos.y } )
}
