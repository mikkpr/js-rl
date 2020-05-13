import { RNG } from 'rot-js';
import { GUI } from 'dat.gui';
import Vector from 'victor';
import { MAPWIDTH, MAPHEIGHT } from '..';
import { Rect, separation, cohesion } from './flocking';

const debugRects: Rect[] = [
  {
    x: 5,
    y: 5,
    w: 15,
    h: 15
  }, {
    x: 4,
    y: 4,
    w: 15,
    h: 15
  }, {
    x: 3,
    y: 5,
    w: 15,
    h: 15
  }, {
    x: 5,
    y: 5,
    w: 15,
    h: 15
  }, {
    x: 4,
    y: 4,
    w: 15,
    h: 15
  }, {
    x: 3,
    y: 5,
    w: 15,
    h: 15
  }, {
    x: 5,
    y: 5,
    w: 15,
    h: 15
  }, {
    x: 4,
    y: 4,
    w: 15,
    h: 15
  }, {
    x: 3,
    y: 5,
    w: 15,
    h: 15
  }, {
    x: 5,
    y: 5,
    w: 15,
    h: 15
  }, {
    x: 4,
    y: 4,
    w: 15,
    h: 15
  }, {
    x: 3,
    y: 5,
    w: 15,
    h: 15
  }
];


class MapGen {
  test: string;
  width: number;
  _initialWidth: number;
  height: number;
  _initialHeight: number;
  gui: GUI;
  seed: number;
  canvas: HTMLCanvasElement;
  drawingInterval: NodeJS.Timeout;
  numRects: number;
  separationCoeff: number;
  cohesionCoeff: number;
  running: boolean;
  allRects: Rect[];
  rects: Rect[];
  separation: number;
  cohesion: number;

  constructor(W: number, H: number) {
    this.width = W;
    this.height = H;
    this.numRects = 4;
    this.seed = 0;
    this.gui = new GUI();
    this.gui.remember(this);
    this.drawingInterval = null;
    this.separationCoeff = 1.5;
    this.cohesionCoeff = 1.0;
    this.running = false;
    this.separation = 25.0;
    this.cohesion = 25.0;
    this.init();
    this.initGUI();
  }

  initGUI = (): void => {
    this.gui.add(this, 'numRects', 1, 12, 1);
    this.gui.add(this, 'separation', 1, 100, 1);
    this.gui.add(this, 'separationCoeff', 0, 2.5, 0.1);
    this.gui.add(this, 'cohesion', 1, 100, 1);
    this.gui.add(this, 'cohesionCoeff', 0, 2.5, 0.1);
    this.gui.add(this, 'seed');
    this.gui.add(this, 'regen').name('Generate!')
    this.gui.add(this, 'pause').name('Pause')
    this.gui.add(this, 'play').name('Play')
    this.gui.add(this, 'step').name('Step')

  }

  init = (): void => {
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', (this.width * 8).toString());
    this.canvas.setAttribute('height', (this.height * 8).toString());
    document.querySelector('.levelgen').appendChild(this.canvas);
  }

  draw = (rects: Rect[]) => {
    const [dx, dy] = [this.canvas.width / 2, this.canvas.height / 2];
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    rects.forEach(rect => {
      const { x, y, w, h } = rect;
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'red';
      ctx.rect(x + dx, y + dy, w, h);
      ctx.stroke();
    });
  }

  pause = () => {
    this.running = false;
  }

  play = () => {
    this.running = true;
  }

  step = () => {
    const sepVectors = separation(this.rects, this.separation);
    const cohVectors = cohesion(this.rects, new Vector(this.canvas.width / 2, this.canvas.height / 2), this.cohesion);

    const sum = [...sepVectors, ...cohVectors]
      .map(v => v.magnitude())
      .reduce((sum, m) => sum + m, 0);

    this.rects = this.rects.map((rect, idx) => {
      const newPos = new Vector(
        rect.x + sepVectors[idx].x * this.separationCoeff + cohVectors[idx].x * this.cohesionCoeff,
        rect.y + sepVectors[idx].y * this.separationCoeff + cohVectors[idx].y * this.cohesionCoeff
      );
      return {
        ...rect,
        x: newPos.x,
        y: newPos.y,
      };
    });
    if (sum <= 0.2) {
      clearInterval(this.drawingInterval);
      this.running = false;
      console.log('Done!', this.rects);
    }
    this.draw(this.rects);
  }

  regen = (): void => {
    this.running = true;
    clearInterval(this.drawingInterval);
    RNG.setSeed(this.seed);

    this.allRects = debugRects;

    this.rects = this.allRects.slice(0, this.numRects);

    this.draw(this.rects);
    this.drawingInterval = setInterval(() => {
      if (this.running) {
        this.step();
      }
    }, 1000/10.0);
  }
}
eval('window.MapGen = MapGen');

