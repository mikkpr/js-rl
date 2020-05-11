import { Entity, World } from 'ecsy';
import { Name, Light, Renderable, Viewshed, Position } from '../components';

export const createLight = (
  ECS: World,
  x: number,
  y: number,
  range: number = 7,
  color: Color = [255, 255, 235]
): Entity => {
  return ECS
    .createEntity()
    .addComponent(Light, { range, color })
    .addComponent(Renderable, { glyph: '!', fg: '#aa0' })
    .addComponent(Viewshed, { range: 7 })
    .addComponent(Position, { x, y })
    .addComponent(Name, { name: 'Torch' });
};
