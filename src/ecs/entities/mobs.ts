import { World, Entity } from 'ecsy';

import {
  Position,
  Renderable,
  Viewshed,
  Monster
} from '../components/';

export const createOrc = (ecs, x, y) => {
  const orc = ecs
    .createEntity('Orc')
    .addComponent(Viewshed)
    .addComponent(Renderable, { glyph: 'o', fg: '#f00' })
    .addComponent(Position, { x, y })
    .addComponent(Monster);
  return orc;
}
