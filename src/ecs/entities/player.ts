import { World, Entity } from 'ecsy';

import {
  Position,
  Renderable,
  Viewshed
} from '../components/';

const createPlayer = (ecs: World, x, y): number => {
  const player = (ecs as any)
    .createEntity("player")
    .addComponent(Viewshed, { range: 6, visibleTiles: [], exploredTiles: new Set<number>(), dirty: true })
    .addComponent(Renderable, { glyph: '@', fg: '#ff0', bg: null })
    .addComponent(Position, { x: x, y: y });
  return player.id;
};

export default createPlayer;
