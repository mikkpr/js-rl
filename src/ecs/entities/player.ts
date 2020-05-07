import { World, Entity } from 'ecsy';

import {
  Position,
  Renderable,
  Viewshed
} from '../components/';

const createPlayer = (ecs: World): number => {
  const player = (ecs as any)
    .createEntity("player")
    .addComponent(Position)
    .addComponent(Renderable, { glyph: '@', fg: '#ff0' })
    .addComponent(Viewshed, { range: 5 });
  return player.id;
};

export default createPlayer;
