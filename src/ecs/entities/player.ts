import { World, Entity } from 'ecsy';

import {
  Position,
  Renderable,
  Viewshed,
  Light,
  Name,
} from '../components/';

const createPlayer = (ecs: World, x: number, y: number): number => {
  const player = (ecs as any)
    .createEntity('player')
    .addComponent(Viewshed, { range: 20, dirty: true })
    .addComponent(Renderable, { glyph: '@', fg: '#ff0', z: 2 })
    .addComponent(Position, { x, y })
    .addComponent(Light, { range: 20, color: [255, 255, 255], applicable: true, dirty: true })
    .addComponent(Name, { name: 'You!' });
  return player;
};

export default createPlayer;
