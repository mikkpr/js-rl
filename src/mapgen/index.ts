import { RNG } from 'rot-js';
import { GUI } from 'dat.gui';
import Vector from 'victor';
import { MAPWIDTH, MAPHEIGHT } from '..';
import { MovableRect, dSquared, separation, cohesion } from './flocking';

const FPS = 1000/30.0;

function colorGradient(fadeFraction, rgbColor1, rgbColor2, rgbColor3) {
  let color1 = rgbColor1;
  let color2 = rgbColor2;
  let fade = fadeFraction;

  // Do we have 3 colors for the gradient? Need to adjust the params.
  if (rgbColor3) {
    fade = fade * 2;

    // Find which interval to use and adjust the fade percentage
    if (fade >= 1) {
      fade -= 1;
      color1 = rgbColor2;
      color2 = rgbColor3;
    }
  }

  const diffRed = color2.red - color1.red;
  const diffGreen = color2.green - color1.green;
  const diffBlue = color2.blue - color1.blue;

  const gradient = {
    red: Math.floor(color1.red + (diffRed * fade)),
    green: Math.floor(color1.green + (diffGreen * fade)),
    blue: Math.floor(color1.blue + (diffBlue * fade)),
  };

  return 'rgb(' + gradient.red + ',' + gradient.green + ',' + gradient.blue + ')';
}

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
  rects: MovableRect[];
  separation: number;
  cohesion: number;
  done: boolean;
  rectCenter: Vector;
  friction: number;
  minRoomSize: number;
  maxRoomSize: number;
  roomHeightWidthRatio: number;

  constructor(W: number, H: number) {
    this.width = W;
    this.height = H;
    this.numRects = 50;
    this.seed = 0;
    this.gui = new GUI();
    this.gui.remember(this);
    this.drawingInterval = null;
    this.separationCoeff = 10;
    this.cohesionCoeff = 0.1;
    this.running = false;
    this.separation = 10.0;
    this.cohesion = 150.0;
    this.friction = 0.9;
    this.minRoomSize = 30;
    this.maxRoomSize = 60;
    this.roomHeightWidthRatio = 1.3;
    this.init();
    this.initGUI();
    this.done = false;
    this.rectCenter = new Vector(W * 4, H * 4);
  }

  initGUI = (): void => {
    this.gui.add(this, 'seed');
    const rects = this.gui.addFolder('Rects');
    rects.add(this, 'numRects', 1, 150, 1).name('Initial count');
    rects.add(this, 'minRoomSize', 1, 100, 1);
    rects.add(this, 'maxRoomSize', 1, 200, 1);
    rects.add(this, 'roomHeightWidthRatio', 0.25, 2.0, 0.1);
    const flock = this.gui.addFolder('Flocking');
    flock.open()
    flock.add(this, 'separation', 1, 1000, 1);
    flock.add(this, 'separationCoeff', 0, 10.0, 0.1);
    flock.add(this, 'cohesion', 1, 1000, 1);
    flock.add(this, 'cohesionCoeff', 0, 10.0, 0.1);
    flock.add(this, 'friction', 0.1, 2.0, 0.01);
    this.gui.add(this, 'regen').name('Generate!');
    this.gui.add(this, 'pause').name('Pause');
    this.gui.add(this, 'play').name('Play');
    this.gui.add(this, 'step').name('Step');

  }

  init = (): void => {
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', (this.width * 8).toString());
    this.canvas.setAttribute('height', (this.height * 8).toString());
    document.querySelector('.levelgen').appendChild(this.canvas);
  }

  draw = (rects: MovableRect[]) => {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    rects.forEach((rect, i) => {
      const { x, y, w, h } = rect;
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = colorGradient((i+1)/this.numRects, {
        red: 255,
        green: 0,
        blue: 0
      }, {
        red: 0,
        green: 255,
        blue: 0
      }, {
        red: 0,
        green: 0,
        blue: 255
      });
      ctx.rect(x - w/2, y - h/2, w, h);
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
    const sepVectors = separation(this.rects, this.separation, this.rectCenter.clone());
    const cohVectors = cohesion(this.rects, this.cohesion, this.rectCenter.clone());

    this.rects = this.rects
      .map((rect, idx) => {
        const sepVector = sepVectors[idx].multiplyScalar(this.separationCoeff);
        const cohVector = cohVectors[idx].multiplyScalar(this.cohesionCoeff);
        return {
          ...rect,
          acceleration: rect.acceleration
            .add(sepVector)
            .add(cohVector)
        };
      })
      .map((rect, idx) => {
        rect.velocity.add(rect.acceleration);
        if (rect.velocity.magnitude() > 3) {
          rect.velocity.normalize().multiplyScalar(3);
        }
        const acceleration = new Vector(0, 0);
        const x = rect.x + rect.velocity.x;
        const y = rect.y + rect.velocity.y;
        const rectPos = new Vector(x, y);
        rect.velocity.multiplyScalar(this.friction);
        return {
          ...rect,
          acceleration,
          x,
          y
        };
      });
    //console.log(this.rects);
    this.draw(this.rects);
  }

  getRect = () => {
    const center = [this.canvas.width / 2, this.canvas.height / 2];
    const w = RNG.getUniformInt(this.minRoomSize, this.maxRoomSize);
    const hMin = ~~(w / this.roomHeightWidthRatio);
    const hMax = ~~(w * this.roomHeightWidthRatio);
    const h = RNG.getUniformInt(Math.min(hMin, hMax), Math.max(hMin, hMax));
    let rect = {
      x: RNG.getUniformInt(-20, 20) + center[0],
      y: RNG.getUniformInt(-20, 20) + center[1],
      w,
      h,
      velocity: new Vector(0, 0),
      acceleration: new Vector(0, 0)
    };
    if (RNG.getUniformInt(0, 1)) {
      const { w, h } = rect;
      rect = {
        ...rect,
        w: h,
        h: w
      };
    }
    return rect;
  }

  regen = (): void => {
    this.running = true;
    this.done = false;
    clearInterval(this.drawingInterval);
    RNG.setSeed(this.seed);

    this.rects = [];
    for (let i = 1; i <= this.numRects; i++) {
      this.rects.push(this.getRect());
    }
    const boundingRect = this.rects.reduce((acc, rect) => {
      return {
        l: Math.min(rect.x - rect.w / 2, acc.l),
        t: Math.min(rect.y - rect.h / 2, acc.t),
        r: Math.max(rect.x + rect.w / 2, acc.r),
        b: Math.max(rect.y + rect.h / 2, acc.b),
      }
    }, {l: Infinity, t: Infinity, r: -Infinity, b: -Infinity});
    this.rectCenter = new Vector((boundingRect.r + boundingRect.l) / 2, (boundingRect.b + boundingRect.t) / 2);
    this.rects = this.rects.map(r => {
      const pos = new Vector(r.x, r.y);
      return {
        ...r,
        velocity: this.rectCenter.clone().subtract(pos).normalize().invert()
      };
    });
    this.draw(this.rects);
    this.drawingInterval = setInterval(() => {
      if (this.running) {
        this.step();
      }
    }, FPS);
  }
}
eval('window.MapGen = MapGen');

