import * as ROT from 'rot-js';

const WIDTH: number = 64;
const HEIGHT: number = 32;

let display: ROT.Display;

const setup = (): void => {
  const options = {
    width: WIDTH,
    height: HEIGHT,
    font: 'Fira Mono'
  };
  display = new ROT.Display(options)

  console.log(display.getContainer());

  document.querySelector('.main').appendChild(display.getContainer());

  display.draw(WIDTH / 2, HEIGHT / 2, '@', '#fff', '#000')
};

setup();
