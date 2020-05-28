import state from '.';
import {
  Position,
  Player,
  Glyph,
  AI,
  Viewshed,
  Body,
  Camera,
  MeleeCombat,
  Health,
  Name,
} from './components';

export const createPlayer = ({x, y}) => {
  const player = state.world.createEntity();
  state.world.registerComponent(player, {
    _type: Player
  });
  state.world.registerComponent(player, {
    _type: Position,
    x: x,
    y: y,
  } as Position);
  state.world.registerComponent(player, {
    _type: Glyph,
    glyph: '@',
    fg: '#fa0',
    bg: '#000',
  } as Glyph);
  state.world.registerComponent(player, {
    _type: Viewshed,
    range: 24,
    exploredCells: new Set<number>(),
    visibleCells: new Set<number>(),
    dirty: true,
  } as Viewshed);
  state.world.registerComponent(player, {
    _type: Body,
    solid: true,
  } as Body);
  state.world.registerComponent(player, {
    _type: Camera,
    active: true,
  } as Camera);
  state.world.registerComponent(player, {
    _type: MeleeCombat,
    damage: 1
  } as MeleeCombat);
  state.world.registerComponent(player, {
    _type: Health,
    health: 5,
    maxHealth: 5,
    dead: false
  } as Health);
  state.world.registerComponent(player, {
    _type: Name,
    name: 'you'
  } as Name);

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
  state.world.registerComponent(kobold, {
    _type: MeleeCombat,
    damage: 1
  } as MeleeCombat);
  state.world.registerComponent(kobold, {
    _type: Health,
    health: 2,
    maxHealth: 2,
    dead: false
  } as Health);
  state.world.registerComponent(kobold, {
    _type: Name,
    name: 'kobold'
  } as Name);


  return kobold;
}
