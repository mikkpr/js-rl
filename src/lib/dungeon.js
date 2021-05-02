import random from 'lodash/random';
import times from 'lodash/times';
import ecs from '../state/ecs';
import { rectangle, rectsIntersect } from './grid';

import {
  Appearance,
  Position,
  IsBlocking,
  Layer100,
  IsOpaque,
} from '../state/components';

function digHorizontalPassage(x1, x2, y) {
  const tiles = {};
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2);
  let x = start;

  while (x <= end) {
    tiles[`${x},${y}`] = { x, y, sprite: 'FLOOR' };
    x++;
  }

  return tiles;
}

function digVerticalPassage(y1, y2, x) {
  const tiles = {};
  const start = Math.min(y1, y2);
  const end = Math.max(y1, y2);
  let y = start;

  while (y <= end) {
    tiles[`${x},${y}`] = { x, y, sprite: 'FLOOR' };
    y++;
  }

  return tiles;
}

export const createDungeon = ({
  x,
  y,
  width,
  height,
  minRoomSize = 6,
  maxRoomSize = 12,
  maxRoomCount = 30,
}) => {
  const dungeon = rectangle(
    { x, y, width, height },
    { sprite: 'WALL' }
  );

  const rooms = [];
  let roomTiles = {};


  times(maxRoomCount, () => {
    let rw = random(minRoomSize, maxRoomSize);
    let rh = random(minRoomSize, maxRoomSize);
    let rx = random(x, width + x - rw);
    let ry = random(y, height + y - rh);

    const candidate = rectangle(
      { x: rx, y: ry, width: rw, height: rh, hasWalls: true },
      { sprite: 'FLOOR' }
    );

    if (!rooms.some(room => rectsIntersect(room, candidate))) {
      rooms.push(candidate);
      roomTiles = { ...roomTiles, ...candidate.tiles };
    }
  });

  let prevRoom = null;
  let passageTiles;

  for (let room of rooms.sort(
    // rough sort by distance
    (a, b) => Math.sqrt(a.x ** 2 + a.y ** 2) - Math.sqrt(b.x ** 2 + b.y ** 2)
  )) {
    if (prevRoom) {
      const prev = prevRoom.center;
      const curr = room.center;

      passageTiles = {
        ...passageTiles,
        ...digHorizontalPassage(prev.x, curr.x, curr.y),
        ...digVerticalPassage(prev.y, curr.y, prev.x),
      }
    }

    prevRoom = room;
  }

  dungeon.rooms = rooms;

  dungeon.tiles = {
    ...dungeon.tiles,
    ...roomTiles,
    ...passageTiles,
  };

  Object.keys(dungeon.tiles).forEach(key => {
    const tile = dungeon.tiles[key];

    if (tile.sprite === 'WALL') {
      const entity = ecs.createEntity();
      entity.add(Appearance, { char: '#', color: '#555' });
      entity.add(IsBlocking);
      entity.add(IsOpaque);
      entity.add(Layer100);
      entity.add(Position, dungeon.tiles[key]);
    }

    if (tile.sprite === 'FLOOR') {
      const entity = ecs.createEntity();
      entity.add(Appearance, { char: '.', color: '#555' });
      entity.add(Layer100);
      entity.add(Position, dungeon.tiles[key]);
    }
  });

  return dungeon;
};
