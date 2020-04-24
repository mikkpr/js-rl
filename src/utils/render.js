import * as ROT from 'rot-js';
import { WIDTH, HEIGHT } from '../index';
import game from '../gamestate';
import { CELL_PROPERTIES } from '../map';

const chromaticAberration = (ctx, intensity, phase, width, height) => {
  const canvas = ctx.canvas;
  /* Use canvas to draw the original image, and load pixel data by calling getImageData
     The ImageData.data is an one-dimentional Uint8Array with all the color elements flattened. The array contains data in the sequence of [r,g,b,a,r,g,b,a...]
     Because of the cross-origin issue, remember to run the demo in a localhost server or the getImageData call will throw error
  */
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = phase % 4; i < data.length; i += 4) {
    // Setting the start of the loop to a different integer will change the aberration color, but a start integer of 4n-1 will not work
    data[i] = data[i + 4 * intensity];
  }
  ctx.putImageData(imageData, 0, 0);
};

export const applyChromaticAberration = (display, intensity = 1, phase = 5) => {
  const canvas = display.getContainer();
  const context = canvas.getContext('2d');

  chromaticAberration(context, intensity, phase);
};

export const pulseAberration = (display, intensity, phase, duration, callback = () => {}) => {
  let pulsing = true;
  const timeout = setTimeout(() => {
    pulsing = false;
    requestAnimationFrame(callback);
  }, duration);

  function pulse() {
    applyChromaticAberration(display, intensity, phase);

    if (pulsing) {
      requestAnimationFrame(pulse);
    }
  }

  requestAnimationFrame(pulse);

  return timeout;
};

export const renderMap = display => {
  const { map, lightingMap, explorationMap, mapOffset } = game.getState();

  const cells = Object.values(map);

  cells.forEach(cell => {
    const {
      x,
      y,
      type
    } = cell;
    const {
      char,
      fg,
      bg,
    } = CELL_PROPERTIES[type];
    const key = `${x}_${y}`;
    const visibility = key in lightingMap
      ? lightingMap[key]
      : explorationMap.includes(key)
      ? 0.25
      : 0;

    const color = ROT.Color.toHex(ROT.Color.interpolate(
      ROT.Color.fromString(bg),
      char === '.'
        ? ROT.Color.multiply(
            ROT.Color.fromString(fg),
            [128, 128, 128],
        )
        : ROT.Color.fromString(fg),
      visibility,
    ));
    const Xoffset = mapOffset[0] * -WIDTH;
    const Yoffset = mapOffset[1] * -HEIGHT;
    display.draw(x + Xoffset, y + Yoffset, char, color, bg);
  });
}

export const renderPlayer = display => {
  const { player, mapOffset } = game.getState();
  const { x, y } = player;
  const Xoffset = mapOffset[0] * -WIDTH;
  const Yoffset = mapOffset[1] * -HEIGHT;

  display.draw(x + Xoffset, y + Yoffset, '@', '#fff', '#000');
};

export const redraw = (pulse = false, pulseOptions) => {
  display.clear();

  renderMap(display);

  renderPlayer(display);

  if (pulse) {
    const randomIntensity = Math.max(0, 1 - Math.floor(Math.random() * 5));
    const randomPhase = Math.max(0, 1 - Math.floor(Math.random() * 5));
    const { intensity, phase, duration } = (pulseOptions || {});
    pulseAberration(
      display,
      intensity || randomIntensity,
      duration || 16,
      phase || randomPhase,
      () => redraw(false)
    );
  }
};
