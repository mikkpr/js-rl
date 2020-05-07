import { World, Entity } from 'ecsy';

import {
  Position,
  Renderable,
  Viewshed
} from '../components/';

const createPlayer = (ecs: World, x: number, y: number): number => {
  const player = (ecs as any)
    .createEntity('player')
    .addComponent(Viewshed)
    .addComponent(Renderable, { glyph: '@', fg: '#ff0' })
    .addComponent(Position, { x, y });
  return player;
};

export default createPlayer;
