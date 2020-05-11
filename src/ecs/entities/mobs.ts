import { World, Entity } from 'ecsy';

import {
  Position,
  Renderable,
  Viewshed,
  Monster,
  Name,
} from '../components/';

export const createOrc = (ecs, x, y) => {
  const orc = ecs
    .createEntity('Orc')
    .addComponent(Viewshed)
    .addComponent(Renderable, { glyph: 'o', fg: '#a00', z: 1 })
    .addComponent(Position, { x, y })
    .addComponent(Monster)
    .addComponent(Name, { name: 'Orc' });
  return orc;
};
