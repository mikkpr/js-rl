export const isCell = cellOrArea => cellOrArea.length === 2;
export const isArea = cellOrArea => cellOrArea.length === 4;

export const getZoneCells = zone => {
  return zone.cells.reduce((cells, cellOrArea) => {
    if (isArea(cellOrArea)) {
      const [x, y, w, h] = cellOrArea;
      const areaCells = [];
      for (let _x = x; _x < x + w; _x++ ) {
        for (let _y = y; _y < y + h; _y++) {
          cells.push([_x, _y]);
        }
      }
      cells.push(...areaCells);
    } else if (isCell(cellOrArea)) {
      cells.push(cellOrArea);
    }
    return cells;
  }, [])
};