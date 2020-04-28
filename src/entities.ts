import { action } from './state';
import { GLYPHS, GLYPH_TYPES } from './glyphs';

export const ENTITY_TYPES = {
  PLAYER: 'PLAYER',
  FOLIAGE: 'FOLIAGE'
};

export const ENTITY_PROPERTIES = {
  [ENTITY_TYPES.PLAYER]: {
    controllable: true
  }
};

export const setupEntities = ({ WIDTH, HEIGHT, BOTTOM_PANEL_HEIGHT, playerID }): void => {
  const playerInitialPos = {
    x: Math.floor(WIDTH / 2),
    y: Math.floor((HEIGHT - BOTTOM_PANEL_HEIGHT) / 2)
  };
  const entities = [];
  entities.push({
    ...playerInitialPos,
    glyph: GLYPH_TYPES.PLAYER,
    type: ENTITY_TYPES.PLAYER,
    id: playerID
  });
  action('UPDATE_ENTITIES', { entities });
}