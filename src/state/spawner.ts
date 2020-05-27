import state from '.';
import {
  Position,
  Player,
  Glyph,
  AI,
  Viewshed,
  Body,
} from './components';

export const createPlayer = ({x, y}) => {
  const player = state.world.createEntity();
  state.world.registerComponent(player, {
    _type: Player
  });
  state.world.registerComponent(player, {
    x: x,
    y: y,
    _type: Position
  } as Position);
  state.world.registerComponent(player, {
    glyph: '@',
    fg: '#fa0',
    bg: '#000',
    _type: Glyph
  } as Glyph);
  state.world.registerComponent(player, {
    range: 7,
    exploredCells: new Set<number>(),
    visibleCells: new Set<number>(),
    dirty: true,
    _type: Viewshed
  } as Viewshed);
  state.world.registerComponent(player, {
    solid: true,
    _type: Body
  } as Body);

  return player;
}

export const createKobold = ({x, y}) => {
  const kobold = state.world.createEntity();
  state.world.registerComponent(kobold, {
    x,
    y,
    _type: Position
  } as Position);
  state.world.registerComponent(kobold, {
    glyph: 'k',
    fg: '#666',
    bg: '#000',
    _type: Glyph
  } as Glyph);
  state.world.registerComponent(kobold, {
    _type: AI,
    ai: ['AVOID_PLAYER', 'RANDOM_WALK']
  } as AI);
  state.world.registerComponent(kobold, {
    range: 5,
    exploredCells: new Set<number>(),
    visibleCells: new Set<number>(),
    dirty: true,
    _type: Viewshed
  } as Viewshed);
  state.world.registerComponent(kobold, {
    solid: true,
    _type: Body
  } as Body);

  return kobold;
}
