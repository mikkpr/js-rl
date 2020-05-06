import { World, Entity } from 'ecsy';

import { Position, Renderable } from '../components/';

const createPlayer = (ecs: World, x: number, y: number): Entity => {
  return (ecs as World)
    .createEntity()
    .addComponent(Position, { x, y })
    .addComponent(Renderable, { glyph: '@', fg: '#ff0' });
}

export default createPlayer;