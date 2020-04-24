import * as ROT from 'rot-js';
const isDoor = (x, y, doors = []) => {
  return doors.reduce((acc, door) => {
    return acc || (door[0] === x && door[1] === y);
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

const createCellsFromRoom = room => {
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
        char: getChar(room, _x, _y),
        fg: floorColor,
        bg: backgroundColor,
        solid: false
      });
    }
  }
  // create walls
  // top wall
  for (let _x = x, _y = y; _x <= x + width - 1; _x++) {
    cells.push({
      x: _x,
      y: _y,
      char: getChar(room, _x, _y),
      fg: color,
      bg: backgroundColor,
      solid: true,
    });
  }
  // bottom wall
  for (let _x = x, _y = y + height - 1; _x <= x + width - 1; _x++) {
    cells.push({
      x: _x,
      y: _y,
      char: getChar(room, _x, _y),
      fg: color,
      bg: backgroundColor,
      solid: true,
    });
  }
  // left wall
  for (let _x = x, _y = y + 1; _y <= y + height - 1; _y++) {
    cells.push({
      x: _x,
      y: _y,
      char: getChar(room, _x, _y),
      fg: color,
      bg: backgroundColor,
      solid: true,
    });
  }
  // right wall
  for (let _x = x + width - 1, _y = y + 1; _y <= y + height - 1; _y++) {
    cells.push({
      x: _x,
      y: _y,
      char: getChar(room, _x, _y),
      fg: color,
      bg: backgroundColor,
      solid: true,
    });
  }
  // doors
  doors.forEach((door) => {
    cells.push({
      x: door[0],
      y: door[1],
      char: '.',
      fg: floorColor,
      bg: backgroundColor,
      solid: false,
    });
  });
  return cells;
};

export const createMapFromRooms = (rooms) => {
  return rooms.reduce((cells, room) => {
    const roomCells = createCellsFromRoom(room);
    return cells.concat(roomCells);
  }, []);
};

export const level0 = [
  {
    x: 0,
    y: 0,
    width: 21,
    height: 21,
    doors: [[10, 20]],
    char: '#',
    color: '#fff',
    backgroundColor: '#000',
    floorColor: '#aaa',
  }, {
    x: 4,
    y: 4,
    width: 13,
    height: 13,
    doors: [[4, 10]],
    char: '#',
    color: '#fff',
    backgroundColor: '#000',
    floorColor: '#bbb',
  }, {
    x: 8,
    y: 8,
    width: 5,
    height: 5,
    doors: [[12, 10]],
    char: '#',
    color: '#fff',
    backgroundColor: '#000',
    floorColor: '#ccc',
  }, {
    x: 4,
    y: 25,
    width: 13,
    height: 13,
    doors: [[10, 25]],
    char: '#',
    color: '#ffa',
    backgroundColor: '#000',
    floorColor: '#330',
  },
];

export const level0portals = [
  {
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
