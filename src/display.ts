import * as ROT from 'rot-js';
import { Display } from "rot-js";

export const setupDisplay = (options: {width: number; height: number }): ROT.Display => {
  const display = new ROT.Display({
    width: options.width,
    height: options.height,
    fontFamily: 'IBMVGA8',
    forceSquareRatio: true,
    fontSize: 16,
    spacing: 1.0
  });

  document.querySelector('.main').appendChild(display.getContainer());

  return display;
};
