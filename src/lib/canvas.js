import { rectangle } from './grid';
const pixelRatio = window.devicePixelRatio || 1;
const canvas = document.querySelector('.main');
const ctx = canvas.getContext('2d');

export const grid = {
  width: 60,
  height: 30,

  map: {
    width: 40,
    height: 24,
    x: 21,
    y: 3,
  },

  messageLog: {
    width: 60,
    height: 3,
    x: 21,
    y: 0,
  },

  playerHud: {
    width: 20,
    height: 27,
    x: 0,
    y: 0,
  },

  infoBar: {
    width: 60,
    height: 3,
    x: 21,
    y: 27,
  },

  inventory: {
    width: 20,
    height: 22,
    x: 21,
    y: 4,
  },
};

const lineHeight = 1.3;

let calculatedFontSize = Math.floor((window.innerHeight - 30) / grid.height / lineHeight);
let cellWidth = calculatedFontSize * pixelRatio;
let cellHeight = calculatedFontSize * pixelRatio * lineHeight;
let fontSize = calculatedFontSize * pixelRatio;

canvas.style.cssText = `width: ${calculatedFontSize * grid.width}; height: ${calculatedFontSize * grid.height * lineHeight}; outline: 1px solid rgba(255,255,255,0.1);`;
canvas.width = cellWidth * grid.width;
canvas.height = cellHeight * grid.height;

ctx.font = `normal ${fontSize}px 'Fira Code'`;
ctx.textAlign = `center`;
ctx.textBaseLine = `middle`;

export const drawText = template => {
  const textToRender = template.text;

  textToRender.split('').forEach((char, index) => {
    const options = { ...template };
    const character = {
      appearance: {
        char,
        background: options.background,
        color: options.color,
      },
      position: {
        x: index + options.x,
        y: options.y,
      }
    };

    delete options.x;
    delete options.y;

    drawCell(character, options);
  });
}

export const drawChar = ({ char, color, position }) => {
  ctx.fillStyle = color;
  ctx.fillText(
    char,
    position.x * cellWidth + cellWidth / 2,
    position.y * cellHeight + cellHeight / 2,
  );
};

const drawBackground = ({ color, position }) => {
  if (color === "transparent") { return; }

  ctx.fillStyle = color;

  ctx.fillRect(
    position.x * cellWidth,
    position.y * cellHeight,
    cellWidth,
    cellHeight,
  );
}

export const drawCell = (entity, options = {}) => {
  const char = options.char || entity.appearance.char;
  const background = options.background || entity.appearance.background;
  const color = options.color || entity.appearance.color;
  const position = entity.position;

  drawBackground({ color: background, position });
  drawChar({ char, color, position });
};

export const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export const pxToCell = (ev) => {
  const bounds = canvas.getBoundingClientRect();
  const relativeX = ev.clientX - bounds.left;
  const relativeY = ev.clientY - bounds.top;
  const colPos = Math.trunc((relativeX / cellWidth) * pixelRatio);
  const rowPos = Math.trunc((relativeY / cellHeight) * pixelRatio);

  return [colPos, rowPos];
}

export const drawRect = (x, y, width, height, color) => {
  const rect = rectangle({ x, y, width, height });
  Object.values(rect.tiles).forEach(position => {
    drawBackground({ color, position });
  });
};
