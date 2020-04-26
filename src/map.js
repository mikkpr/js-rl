import * as ROT from 'rot-js';
import ID from './utils/id';

export const CELL_TYPES = {
  FLOOR: 'FLOOR',
  WALL: 'WALL',
  DOOR_OPEN: 'DOOR_OPEN',
  DOOR_CLOSED: 'DOOR_CLOSED',
  PORTAL: 'PORTAL',
};
export const CELL_PROPERTIES = {
  [CELL_TYPES.FLOOR]: {
    char: '.',
    fg: '#aaa',
    bg: '#000',
    solid: false,
  },
  [CELL_TYPES.WALL]: {
    char: '#',
    fg: '#fff',
    bg: '#000',
    solid: true,
  },
  [CELL_TYPES.DOOR_OPEN]: {
    char: '\'',
    fg: '#aaa',
    bg: '#000',
    solid: false,
  },
  [CELL_TYPES.DOOR_CLOSED]: {
    char: '+',
    fg: '#aaa',
    bg: '#000',
    solid: true,
  },
  [CELL_TYPES.PORTAL]: {
    char: '~',
    fg: '#faf',
    bg: '#000',
    solid: false,
  },
};

const isDoor = (x, y, portals = []) => {
  return portals.filter(p => p.type === 'DOOR').reduce((acc, door) => {
    return acc || (door.from[0] === x && door.from[1] === y);
  }, false);
};

const isWall = (room, x, y) => {
  return (
    (x >= room.x && x <= room.x + room.width - 1 && (y === room.y || y === room.y + room.height - 1)) ||
    (y >= room.y && y <= room.y + room.height - 1 && (x === room.x || x === room.x + room.width - 1))
  );
}

const getChar = (room, x, y) => {
  if (isDoor(x, y, room.doors || [])) {
    return '.';
  }

  if (isWall(room, x, y)) {
    return room.char;
  }

  return '.';
};

const createCellsFromRoom = (room, portals) => {
  const cells = [];
  const {
    x,
    y,
    width,
    height,
    doors,
    color,
    backgroundColor,
    floorColor,
  } = room;
  // create floor
  for (let _x = x + 1; _x <= x + width - 2; _x++) {
    for (let _y = y + 1; _y <= y + height - 2; _y++) {
      cells.push({
        x: _x,
        y: _y,
        type: CELL_TYPES.FLOOR,
      });
    }
  }
  // create walls
  // top wall
  for (let _x = x, _y = y; _x <= x + width - 1; _x++) {
    cells.push({
      x: _x,
      y: _y,
      type: CELL_TYPES.WALL,
    });
  }
  // bottom wall
  for (let _x = x, _y = y + height - 1; _x <= x + width - 1; _x++) {
    cells.push({
      x: _x,
      y: _y,
      type: CELL_TYPES.WALL,
    });
  }
  // left wall
  for (let _x = x, _y = y + 1; _y <= y + height - 1; _y++) {
    cells.push({
      x: _x,
      y: _y,
      type: CELL_TYPES.WALL,
    });
  }
  // right wall
  for (let _x = x + width - 1, _y = y + 1; _y <= y + height - 1; _y++) {
    cells.push({
      x: _x,
      y: _y,
      type: CELL_TYPES.WALL,
    });
  }
  // doors
  portals.filter(p => p.type === 'DOOR').forEach((portal) => {
    cells.push({
      x: portal.from[0],
      y: portal.from[1],
      type: CELL_TYPES.DOOR_CLOSED,
    });
  });
  return cells;
};

export const createMapFromRooms = (rooms, portals) => {
  return rooms.reduce((cells, room) => {
    const roomCells = createCellsFromRoom(room, portals);
    return cells.concat(roomCells);
  }, []);
};

export const level0 = [
  {
    x: 0,
    y: 0,
    width: 21,
    height: 21,
  }, {
    x: 4,
    y: 4,
    width: 13,
    height: 13,
  }, {
    x: 8,
    y: 8,
    width: 5,
    height: 5,
  }, {
    x: 4,
    y: 25,
    width: 13,
    height: 13,
  },
];

export const level0portals = [
  {
    from: [12, 10],
    to: [12, 10],
    dir: [-1, 0],
    type: 'DOOR',
  }, {
    from: [12, 10],
    to: [12, 10],
    dir: [0, 1],
    type: 'DOOR',
  }, {
    from: [4, 10],
    to: [4, 10],
    dir: [1, 0],
    type: 'DOOR',
  }, {
    from: [4, 10],
    to: [4, 10],
    dir: [-1, 0],
    type: 'DOOR',
  }, {
    from: [10, 20],
    to: [10, 25],
    dir: [0, 1],
    type: 'DOOR',
  }, {
    from: [10, 25],
    to: [10, 20],
    dir: [0, -1],
    type: 'DOOR',
  }, {
    from: [19, 1],
    to: [10, 10],
    dir: [0, -1],
    type: 'PORTAL',
  }, {
    from: [19, 1],
    to: [10, 31],
    dir: [1, 0],
    type: 'PORTAL',
  },
];

// const intersects = (room1, room2) => {

// }

// const generateDungeonSkeleton = (branches) => {
//   const rooms = [];
//   const initialRoom = {
//     type: 'ROOM',
//     doors: ['N', 'S', 'E', 'W'],

//   }
// }


// {
//   id: '_1000',
//   type:' ROOM',
//   dungeonCoords: [0, 0],
//   connections: {
//     E: '_1001'
//   },

// }
