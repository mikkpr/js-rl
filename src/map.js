const isDoor = (x, y, doors = []) => {
  return doors.reduce((acc, door) => {
    console.log(door)
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
}

const createCellsFromRoom = room => {
  const cells = [];
  const {
    x,
    y,
    width,
    height,
    doors,
    char,
    fg,
    bg,
  } = room;
  // create floor
  for (let _x = x + 1; _x <= x + width - 2; _x++) {
    for (let _y = y + 1; _y <= y + height - 2; _y++) {
      cells.push({
        x: _x,
        y: _y,
        char: getChar(room, _x, _y),
        fg,
        bg,
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
      fg,
      bg,
    });
  }
  // bottom wall
  for (let _x = x, _y = y + height - 1; _x <= x + width - 1; _x++) {
    cells.push({
      x: _x,
      y: _y,
      char: getChar(room, _x, _y),
      fg,
      bg,
    });
  }
  // left wall
  for (let _x = x, _y = y + 1; _y <= y + height - 1; _y++) {
    cells.push({
      x: _x,
      y: _y,
      char: getChar(room, _x, _y),
      fg,
      bg,
    });
  }
  // right wall
  for (let _x = x + width - 1, _y = y + 1; _y <= y + height - 1; _y++) {
    cells.push({
      x: _x,
      y: _y,
      char: getChar(room, _x, _y),
      fg,
      bg,
    });
  }
  doors.forEach((door) => {
    cells.push({
      x: door[0],
      y: door[1],
      char: '.',
      fg,
      bg,
    });
  });
  return cells;
};

export const createMapFromRooms = (rooms) => {
  return rooms.reduce((cells, room) => {
    const roomCells = createCellsFromRoom(room);
    console.log(roomCells);
    return cells.concat(roomCells);
  }, []);
};
