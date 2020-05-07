import { World, Entity } from 'ecsy';

import { Position, Renderable } from '../components/';

const createPlayer = (ecs: World, x: number, y: number): number => {
  const player = (ecs as World)
    .createEntity()
    .addComponent(Position, { x, y })
    .addComponent(Renderable, { glyph: '@', fg: '#ff0' });
  return player.id;
};

export default createPlayer;
