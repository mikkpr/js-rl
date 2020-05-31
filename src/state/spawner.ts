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
  Inventory,
  Item,
  Key,
  Trigger,
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
    z: 2
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
    weight: 3,
    solid: true,
  } as Body);
  state.world.registerComponent(player, {
    _type: Camera,
    active: true,
  } as Camera);
  state.world.registerComponent(player, {
    _type: MeleeCombat,
    damage: '1d3',
    verb: 'punch|punches'
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
  state.world.registerComponent(player, {
    _type: Inventory,
    capacity: 3,
    contents: [],
  } as Inventory);

  state.map.setEntityLocation(player, state.map.getIdx(x, y)!);

  return player;
}

export const createKobold = ({x, y}) => {
  const kobold = state.world.createEntity();
  state.world.registerComponent(kobold, {
    _type: Position,
    x,
    y,
  } as Position);
  state.world.registerComponent(kobold, {
    _type: Glyph,
    glyph: 'k',
    fg: '#666',
    bg: '#000',
    z: 1
  } as Glyph);
  state.world.registerComponent(kobold, {
    _type: AI,
    ai: [
      // 'AGGRESS',
      'RETALIATE',
      'AVOID_PLAYER',
      'RANDOM_WALK'
    ]
  } as AI);
  state.world.registerComponent(kobold, {
    _type: Viewshed,
    range: 5,
    exploredCells: new Set<number>(),
    visibleCells: new Set<number>(),
    dirty: true,
  } as Viewshed);
  state.world.registerComponent(kobold, {
    _type: Body,
    solid: true,
    weight: 4,
  } as Body);
  state.world.registerComponent(kobold, {
    _type: MeleeCombat,
    damage: '1d2',
    verb: 'claw|claws'
  } as MeleeCombat);
  state.world.registerComponent(kobold, {
    _type: Health,
    health: 5,
    maxHealth: 5,
    dead: false
  } as Health);
  state.world.registerComponent(kobold, {
    _type: Name,
    name: 'kobold'
  } as Name);
  state.world.registerComponent(kobold, {
    _type: Inventory,
    capacity: 1,
    contents: [],
  } as Inventory);

  state.map.setEntityLocation(kobold, state.map.getIdx(x, y)!);

  return kobold;
}

export const createKey = (params: {
  x?: number;
  y?: number;
  owner?: string | null;
  doorIdx: number;
}) => {
  const { x, y, owner, doorIdx } = params;
  const item = state.world.createEntity();
  let X = x,
      Y = y;
  if (owner) {
    const ownerCmp = state.world.getComponentMap!(owner);
    const inventory = ownerCmp.get(Inventory) as Inventory;
    inventory.contents.push(item);
    const pos = ownerCmp.get(Position) as Position;
    X = pos.x;
    Y = pos.y;
  }
  state.world.registerComponent(item, {
    _type: Item,
    weight: 1,
    owner: owner || null,
  } as Item);
  state.world.registerComponent(item, {
    _type: Glyph,
    glyph: '-',
    fg: '#aa0',
    bg: '#000',
    z: 0
  } as Glyph);
  state.world.registerComponent(item, {
    _type: Name,
    name: 'key'
  } as Name);
  state.world.registerComponent(item, {
    _type: Position,
    x: X,
    y: Y,
  } as Position);
  state.world.registerComponent(item, {
    _type: Key,
    doorIdx,
  } as Key);

  state.map.setEntityLocation(item, state.map.getIdx(X!, Y!)!);
  return item;
}

export const createStash = (params: {
  x?: number;
  y?: number;
  owner?: string | null;
}) => {
  const { x, y, owner } = params;
  const item = state.world.createEntity();
  let X = x,
      Y = y;
  if (owner) {
    const ownerCmp = state.world.getComponentMap!(owner);
    const inventory = ownerCmp.get(Inventory) as Inventory;
    inventory.contents.push(item);
    const pos = ownerCmp.get(Position) as Position;
    X = pos.x;
    Y = pos.y;
  }
  state.world.registerComponent(item, {
    _type: Item,
    weight: 2,
    owner: owner || null,
  } as Item);
  state.world.registerComponent(item, {
    _type: Glyph,
    glyph: '$',
    fg: '#ff0',
    bg: '#000',
    z: 0
  } as Glyph);
  state.world.registerComponent(item, {
    _type: Name,
    name: 'stash of coins'
  } as Name);
  state.world.registerComponent(item, {
    _type: Position,
    x: X,
    y: Y,
  } as Position); 
  state.map.setEntityLocation(item, state.map.getIdx(X!, Y!)!);
  return item;
}

export const createWeightTrigger = ({ x, y, weight, idx, newType, oldType, triggered, messages }) => {
  const trigger = state.world.createEntity();
  state.world.registerComponent(trigger, {
    _type: Position,
    x,
    y,
  } as Position);
  state.world.registerComponent(trigger, {
    _type: Glyph,
    glyph: '≡',
    fg: '#333',
    bg: 'black',
    z: 0,
  } as Glyph);
  state.world.registerComponent(trigger, {
    _type: Name,
    name: 'altar',
    article: 'an'
  } as Name);
  state.world.registerComponent(trigger, {
    _type: Item,
    weight: 10,
    owner: null
  } as Item);
  state.world.registerComponent(trigger, {
    _type: Trigger,
    triggered,
    messages,
    condition: {
      type: 'WEIGHT',
      amount: weight, 
    },
    event: {
      type: 'CHANGE_CELL',
      idx,
      newType,
      oldType,
    },
    repeat: 'TOGGLE'
  } as Trigger); 
  state.map.setEntityLocation(trigger, state.map.getIdx(x, y)!);
}
