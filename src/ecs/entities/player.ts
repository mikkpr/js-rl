import { World, Entity } from 'ecsy';

import {
  Position,
  Renderable,
  Viewshed,
  Light
} from '../components/';

const createPlayer = (ecs: World, x: number, y: number): number => {
  const player = (ecs as any)
    .createEntity('player')
    .addComponent(Viewshed, { range: 12 })
    .addComponent(Renderable, { glyph: '@', fg: '#ff0' })
    .addComponent(Position, { x, y })
    .addComponent(Light, { range: 12, color: [155, 155, 105] });
  return player;
};

export default createPlayer;
