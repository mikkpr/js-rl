import { RNG } from 'rot-js';
import { GUI } from 'dat.gui';
import Delaunator from 'delaunator';
import Vector from 'victor';
import { MAPWIDTH, MAPHEIGHT } from '..';
import { ID } from '../utils/id';
import { MovableRect, dSquared, separation, cohesion } from './flocking';
import { Graph, alg } from 'graphlib';

const FPS = 1000 / 30.0;

enum MapGenState {
  PRERUN = 'PRERUN',
  CREATE_RECTS = 'CREATE_RECTS',
  SEPARATION = 'SEPARATION',
  CLEANUP = 'CLEANUP',
  DELAUNAY = 'DELAUNAY',
  MST = 'MST',
  CYCLES = 'CYCLES'
}

const edgesOfTriangle = (t) => [3 * t, 3 * t + 1, 3 * t + 2];

const triangleOfEdge = (e) => Math.floor(e / 3);

const nextHalfedge = (e) => ((e % 3 === 2) ? e - 2 : e + 1);

const prevHalfedge = (e) => ((e % 3 === 0) ? e + 2 : e - 1);

const forEachTriangleEdge = (points, delaunay, callback) => {
    for (let e = 0; e < delaunay.triangles.length; e++) {
        if (e > delaunay.halfedges[e]) {
            const p = points[delaunay.triangles[e]];
            const q = points[delaunay.triangles[nextHalfedge(e)]];
            callback(e, p, q);
        }
    }
}

const delaunay = rects => {
  const del = Delaunator.from(rects.map(r => [r.x, r.y]));
  return del;
}

export const roundToTilesize = (n, size) => {
  const N = ((n + size - 1) / size);
  return (N - Math.floor(N) > 0.5 ? Math.ceil : Math.floor)(N) * size;
}

const randomPointInEllipse = (r1, r2, x, y) => {
  const t = 2 * Math.PI * RNG.getUniform();
  const u = RNG.getUniform() + RNG.getUniform();
  let R;
  if (u > 1) {
    R = 2 - u
  } else {
    R = u
  }

  return [x + r1 * R * Math.cos(t), y + r2 * R * Math.sin(t)];
}

const colorGradient = (fadeFraction, rgbColor1, rgbColor2, rgbColor3) => {
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
  state: MapGenState;
  roomGraph: Graph;
  MSTGraph: Graph;
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
  spawnRadiusHorizontal: number;
  spawnRadiusVertical: number;
  del?: Delaunator<[number, number]>;

  constructor(W: number, H: number) {
    this.width = W;
    this.height = H;
    this.state = MapGenState.PRERUN;
    this.numRects = 150;
    this.seed = 0;
    this.gui = new GUI();
    this.gui.remember(this);
    this.drawingInterval = null;
    this.separationCoeff = 10;
    this.cohesionCoeff = 0.5;
    this.running = false;
    this.separation = 15.0;
    this.cohesion = 100.0;
    this.friction = 0.9;
    this.minRoomSize = 4;
    this.maxRoomSize = 16;
    this.spawnRadiusHorizontal = 70;
    this.spawnRadiusVertical = 50;
    this.roomHeightWidthRatio = 1.5;
    this.del = undefined;
    this.init();
    this.initGUI();
    this.done = false;
    this.rectCenter = new Vector(W * 4, H * 4);
  }

  initGUI = (): void => {
    this.gui.add(this, 'seed');
    const rects = this.gui.addFolder('Rects');
    rects.add(this, 'numRects', 1, 600, 1).name('Initial count');
    rects.add(this, 'minRoomSize', 1, 100, 1);
    rects.add(this, 'maxRoomSize', 1, 200, 1);
    rects.add(this, 'roomHeightWidthRatio', 0.25, 2.0, 0.1);
    rects.add(this, 'spawnRadiusHorizontal', 10, 1000, 1);
    rects.add(this, 'spawnRadiusVertical', 10, 1000, 1);
    const flock = this.gui.addFolder('Flocking');
    flock.open()
    flock.add(this, 'separation', 5, 1000, 1);
    flock.add(this, 'separationCoeff', 0, 10.0, 0.1);
    flock.add(this, 'cohesion', 1, 1000, 1);
    flock.add(this, 'cohesionCoeff', 0, 10.0, 0.1);
    flock.add(this, 'friction', 0.1, 2.0, 0.01);
    this.gui.add(this, 'restart').name('Restart');
    this.gui.add(this, 'next').name('Next step'); 
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
      const { x, y, w, h, final, discarded } = rect;
      if (discarded) { return; }
      ctx.beginPath();
      ctx.lineWidth = final ? 3 : 1;
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

  drawDel = (del: Delaunator<[number, number]>) => {
    const ctx = this.canvas.getContext('2d');
    if (!del) { return; }
    const color = '#FFFF00';
    forEachTriangleEdge(this.rects.filter(r => r.final), this.del, (e: number, p: MovableRect, q: MovableRect) => {
      this.drawLine(ctx, color)(p, q);
    });
  }

  cleanUpRooms = () => {
    this.rects = this.rects.map((r, idx) => {
      let count = 0;
      for (let i = 0; i < this.rects.length; i++) {
        if (i === idx) { continue; }
        const other = this.rects[i];
        const d = dSquared(r, other);
        if (d === 0) {
          count ++;
        }
      }
      let discarded = true;
      if (count === 0) {
      // if (count < this.numRects * 0.3) {
        discarded = false; 
      }; 

      return {
        ...r, discarded
      };
    });
    this.draw(this.rects);
  }

  findRooms = () => {
    const meanW = this.rects.map(r => r.w).reduce((sum, w) => sum + w, 0) / this.rects.length;
    const meanH = this.rects.map(r => r.h).reduce((sum, h) => sum + h, 0) / this.rects.length;
    const coeff = 1.15;
    this.rects = this.rects.map((r, idx) => {
      if (r.w < (meanW * coeff) || r.h < (meanH * coeff)) { return r; }
      let count = 0;
      for (let i = 0; i < this.rects.length; i++) {
        if (i === idx) { continue; }
        const other = this.rects[i];
        const d = dSquared(r, other);
        if (d === 0) {
          count ++;
        }
      }
      return {
        ...r, final: !r.discarded && count === 0
      };
    });
    this.draw(this.rects);
  }

  next = () => {
    switch (this.state) {
      case MapGenState.PRERUN:
        return this.setState(MapGenState.CREATE_RECTS);
      case MapGenState.CREATE_RECTS:
        return this.setState(MapGenState.SEPARATION);
      case MapGenState.SEPARATION:
        return this.setState(MapGenState.CLEANUP);
      case MapGenState.CLEANUP:
        return this.setState(MapGenState.DELAUNAY);
      case MapGenState.DELAUNAY:
        return this.setState(MapGenState.MST);
      case MapGenState.MST:
        return this.setState(MapGenState.CYCLES);
      default:
        return this.setState(MapGenState.PRERUN);
    }
  }

  step = (initial = false) => {
    const sepVectors = separation(this.rects, initial ? 5 : this.separation, this.rectCenter.clone());
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
        const x = roundToTilesize(rect.x + rect.velocity.x, 1);
        const y = roundToTilesize(rect.y + rect.velocity.y, 1);
        const rectPos = new Vector(x, y);
        rect.velocity.multiplyScalar(this.friction);
        return {
          ...rect,
          acceleration,
          x,
          y
        };
      });
    this.draw(this.rects);
  }

  getRect = () => {
    const center = [this.canvas.width / 2, this.canvas.height / 2];
    const w = RNG.getUniformInt(this.minRoomSize, this.maxRoomSize);
    const hMin = ~~(w / this.roomHeightWidthRatio);
    const hMax = ~~(w * this.roomHeightWidthRatio);
    const h = RNG.getUniformInt(Math.min(hMin, hMax), Math.max(hMin, hMax));
    const [x, y] = randomPointInEllipse(this.spawnRadiusHorizontal, this.spawnRadiusVertical, center[0], center[1]);
    let rect = {
      x,
      y,
      w,
      h,
      velocity: new Vector(0, 0),
      acceleration: new Vector(0, 0),
      id: ID()
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

  generateRoomGraph = () => {
    const finalRooms = this.rects.filter(r => r.final);
    this.del = delaunay(finalRooms);

    this.roomGraph = new Graph({ directed: false });
    finalRooms.forEach((r, idx) => {
      this.roomGraph.setNode(r.id, r);
    });
    this.del.halfedges.forEach(he => {
    
    })

    forEachTriangleEdge(this.rects.filter(r => r.final), this.del, (e: number, p: MovableRect, q: MovableRect) => {
      this.roomGraph.setEdge(p.id, q.id);
    });
    this.draw(this.rects);

    this.drawDel(this.del);
  }

  edgeWeight = rooms => ({ v, w }) => {
    const V = rooms[v];
    const W = rooms[w];
    return (new Vector(V.x, V.y)).distance(new Vector(W.x, W.y));
  }

  generateMSTGraph = () => {
    this.draw(this.rects);
    const rooms = this.rects.reduce((acc, room) => {
      return {
        ...acc,
        [room.id]: room
      }
    }, {});
    this.MSTGraph = alg.prim(this.roomGraph, this.edgeWeight(rooms));
    this.drawDel(this.del);
    this.drawMST(this.MSTGraph);
  }

  drawLine = (ctx, color, lineWidth = 1) => (v, w) => {
    ctx.beginPath();
    ctx.moveTo(v.x, v.y);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.lineTo(w.x, w.y);
    ctx.stroke();
  }

  drawMST = graph => {
    const ctx = this.canvas.getContext('2d');
    if (!graph) { return; }
    const color = '#FF00FF';
    const rooms = this.rects.reduce((acc, room) => {
      return {
        ...acc,
        [room.id]: room
      }
    }, {});

    this.MSTGraph.edges().forEach(edge => {
      const { v, w } = edge;
      this.drawLine(ctx, color, 2)(rooms[v], rooms[w]);
    });
  }

  setState = (newState: MapGenState) => {
    if (newState === MapGenState.PRERUN) {
      this.running = true;
      this.done = false;
      this.del = undefined;
      clearInterval(this.drawingInterval);
      RNG.setSeed(this.seed);
      this.rects = [];
      this.draw(this.rects);
    } else if (newState === MapGenState.CREATE_RECTS) {
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
      this.draw(this.rects);
    } else if (newState === MapGenState.SEPARATION) {
      this.step(true);
      this.draw(this.rects);
      this.drawingInterval = setInterval(() => {
        if (this.running) {
          this.step();
        }
      }, FPS);
    } else if (newState === MapGenState.CLEANUP) {
      clearInterval(this.drawingInterval);
      this.running = false;
      this.done = true;
      this.cleanUpRooms();
      this.findRooms();
      this.draw(this.rects);
    } else if (newState === MapGenState.DELAUNAY) { 
      this.generateRoomGraph();
    } else if (newState === MapGenState.MST) {
      this.generateMSTGraph();
    } else if (newState === MapGenState.CYCLES) {

    }

    this.state = newState; 
  }

  restart = (): void => {
    this.setState(MapGenState.PRERUN);
  }
}
eval('window.MapGen = MapGen');
 
