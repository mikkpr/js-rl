import { RNG } from 'rot-js';import { GUI } from 'dat.gui';
import Delaunator from 'delaunator';
import Vector from 'victor';
import { MAPWIDTH, MAPHEIGHT } from '..';
import { ID } from '../utils/id';
import { MovableRect, dSquared, separation, cohesion } from './flocking';
import { Graph, alg } from 'graphlib';

const FPS = 1000/10.0;

enum MapGenState {
  PRERUN = 'PRERUN',
  CREATE_RECTS = 'CREATE_RECTS',
  SEPARATION = 'SEPARATION',
  CLEANUP = 'CLEANUP',
  DELAUNAY = 'DELAUNAY',
  MST = 'MST',
  CYCLES = 'CYCLES',
  CORRIDORS = 'CORRIDORS',
}

const MapGenStateIdx = {
  [MapGenState.PRERUN]: 1,
  [MapGenState.CREATE_RECTS]: 2,
  [MapGenState.SEPARATION]: 3,
  [MapGenState.CLEANUP]: 4,
  [MapGenState.DELAUNAY]: 5,
  [MapGenState.MST]: 6,
  [MapGenState.CYCLES]: 7,
  [MapGenState.CORRIDORS]: 8,
};

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

const doLinesIntersect = (p0: Vector, p1: Vector, p2: Vector, p3: Vector): boolean => {
    let s1_x, s1_y, s2_x, s2_y;
    s1_x = p1.x - p0.x;     
    s1_y = p1.y - p0.y;
    s2_x = p3.x - p2.x;     
    s2_y = p3.y - p2.y;

    let s, t;
    s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        // // Collision detected
        // if (i_x != NULL)
        //     *i_x = p0_x + (t * s1_x);
        // if (i_y != NULL)
        //     *i_y = p0_y + (t * s1_y);
        return true;
    }

    return false; // No collision
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

interface MapGenParams {
  seed?: number;
  numRects?: number;
  separationCoeff?: number;
  cohesionCoeff?: number;
  separation?: number;
  cohesion?: number;
  friction?: number;
  minRoomSize?: number;
  maxRoomSize?: number;
  roomHeightWidthRatio?: number;
  spawnRadiusHorizontal?: number;
  spawnRadiusVertical?: number;
  cycleEdgePct?: number;
}

interface MapGenOptions {
  W: number,
  H: number,
  callback?: Function,
  draw: boolean,
  loadingCallback?: Function
}

export type MapGenResult = {
  rooms: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    id: string;
  }>,
  corridors: Array<[
    {x: number; y: number},
    {x: number; y: number}
  ]>,
  graph: Graph
};

const defaultOptions = {
  W: 128,
  H: 128,
  callback: () => {},
  draw: false
}


export class MapGen implements MapGenParams {
  autoGen: boolean;
  canvas?: HTMLCanvasElement;
  cohesion: number;
  cohesionCoeff: number;
  corridors: Vector[][];
  cycleEdgePct: number;
  del?: Delaunator<[number, number]>;
  done: boolean;
  doneCallback: Function;
  drawing: boolean;
  drawingInterval: NodeJS.Timeout;
  friction: number;
  gui?: GUI;
  height: number;
  loadingCallback: Function;
  maxRoomSize: number;
  minRoomSize: number;
  MSTGraph?: Graph;
  numRects: number;
  rectCenter: Vector;
  rects: MovableRect[];
  roomGraph?: Graph;
  roomHeightWidthRatio: number;
  running: boolean;
  seed: number;
  separation: number;
  separationCoeff: number;
  spawnRadiusHorizontal: number;
  spawnRadiusVertical: number;
  state: MapGenState;
  width: number;

  static defaultParams: MapGenParams = {
    numRects: 150,
    seed: 0,
    separationCoeff: 10,
    cohesionCoeff: 0.5,
    cycleEdgePct: 0.15,
    separation: 15.0,
    cohesion: 100.0,
    friction: 0.9,
    minRoomSize: 4,
    maxRoomSize: 16,
    spawnRadiusHorizontal: 70,
    spawnRadiusVertical: 50,
    roomHeightWidthRatio: 1.5,
  }

  constructor(options: MapGenOptions = defaultOptions, mapGenParams: MapGenParams = {}) {
    this.width = options.W;
    this.height = options.H;
    this.drawing = options.draw;
    this.doneCallback = options.callback || (() => {});
    this.loadingCallback = options.loadingCallback || (() => {});

    this.numRects = mapGenParams.numRects || MapGen.defaultParams.numRects;
    this.seed = mapGenParams.seed || MapGen.defaultParams.seed;
    this.separationCoeff = mapGenParams.separationCoeff || MapGen.defaultParams.separationCoeff;
    this.cohesionCoeff = mapGenParams.cohesionCoeff || MapGen.defaultParams.cohesionCoeff;
    this.cycleEdgePct = mapGenParams.cycleEdgePct || MapGen.defaultParams.cycleEdgePct;
    this.separation = mapGenParams.separation || MapGen.defaultParams.separation;
    this.cohesion = mapGenParams.cohesion || MapGen.defaultParams.cohesion;
    this.friction = mapGenParams.friction || MapGen.defaultParams.friction;
    this.minRoomSize = mapGenParams.minRoomSize || MapGen.defaultParams.minRoomSize;
    this.maxRoomSize = mapGenParams.maxRoomSize || MapGen.defaultParams.maxRoomSize;
    this.spawnRadiusHorizontal = mapGenParams.spawnRadiusHorizontal || MapGen.defaultParams.spawnRadiusHorizontal;
    this.spawnRadiusVertical = mapGenParams.spawnRadiusVertical || MapGen.defaultParams.spawnRadiusVertical;
    this.roomHeightWidthRatio = mapGenParams.roomHeightWidthRatio || MapGen.defaultParams.roomHeightWidthRatio;

    this.state = MapGenState.PRERUN;
    if (this.loadingCallback) { this.loadingCallback(MapGenState.PRERUN); }

    this.rectCenter = new Vector(~~(this.width / 2), ~~(this.height / 2));
    this.rects = [];
    this.corridors = [];
    this.del = undefined;
    this.drawingInterval = null;

    this.running = false;
    this.done = false;
    this.autoGen = false;
 
    this.init();
    if (this.drawing) {
      this.initGUI();
    }
  }

  initGUI = (): void => {
    this.gui = new GUI();
    this.gui.remember(this);

    this.gui.add(this, 'seed');
    const rects = this.gui.addFolder('Rects');
    rects.add(this, 'numRects', 1, 600, 1).name('Initial count');
    rects.add(this, 'minRoomSize', 1, 100, 1);
    rects.add(this, 'maxRoomSize', 1, 200, 1);
    rects.add(this, 'roomHeightWidthRatio', 0.25, 2.0, 0.1);
    rects.add(this, 'spawnRadiusHorizontal', 10, 1000, 1);
    rects.add(this, 'spawnRadiusVertical', 10, 1000, 1);
    const flock = this.gui.addFolder('Flocking');
    flock.open();
    flock.add(this, 'separation', 5, 1000, 1);
    flock.add(this, 'separationCoeff', 0, 10.0, 0.1);
    flock.add(this, 'cohesion', 1, 1000, 1);
    flock.add(this, 'cohesionCoeff', 0, 10.0, 0.1);
    flock.add(this, 'friction', 0.1, 2.0, 0.01);
    const graph = this.gui.addFolder('Graphs');
    graph.open();
    graph.add(this, 'cycleEdgePct', 0, 1, 0.05);
    this.gui.add(this, 'generate').name('Generate');
    this.gui.add(this, 'restart').name('Restart');
    this.gui.add(this, 'next').name('Next step'); 
  }

  init = (): void => {
    if (!this.drawing) { return; }
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', (this.width).toString());
    this.canvas.setAttribute('height', (this.height).toString());
    document.querySelector('.levelgen').appendChild(this.canvas);
  }

  generate = () => {
    this.running = true;
    this.autoGen = true;
    this.restart();
  }

  draw = (rects: MovableRect[]) => {
    if (!this.drawing) {
      return;
    }
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    rects.forEach((rect, i) => {
      const { x, y, w, h, final, discarded } = rect;
      if (discarded) { return; }
      ctx.beginPath();
      ctx.lineWidth = final ? 3 : 1;
      if (final !== true && this.state === MapGenState.CORRIDORS) {
        ctx.strokeStyle = 'transparent'
      } else if (final !== true) {
        ctx.strokeStyle = 'rgba(255,255,255, 0.2)';
      } else {
        ctx.strokeStyle = 'rgba(255,255,255, 0.8)';
      }
      // ctx.strokeStyle = colorGradient((i+1)/this.numRects, {
      //   red: 255,
      //   green: 0,
      //   blue: 0
      // }, {
      //   red: 0,
      //   green: 255,
      //   blue: 0
      // }, {
      //   red: 0,
      //   green: 0,
      //   blue: 255
      // });
      ctx.rect(x - w/2, y - h/2, w, h);
      ctx.stroke();
    });
  }

  drawDel = (del: Delaunator<[number, number]>) => {
    if (!this.drawing) {
      return;
    }
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

      if (
        (r.x - r.w / 2 <= 0) ||
        (r.y - r.h / 2 <= 0) ||
        (r.x + r.w / 2 >= this.width) ||
        (r.y + r.h / 2 >= this.height)
      ) { discarded = true; }

      return {
        ...r, discarded
      };
    });
    if (!this.drawing) {
      return;
    }
    requestAnimationFrame(() => this.draw(this.rects));
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
    if (!this.drawing) {
      return;
    }
    requestAnimationFrame(() => this.draw(this.rects));
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
      case MapGenState.CYCLES:
        return this.setState(MapGenState.CORRIDORS);
    }
  }

  step = (initial = false) => {
    const sepVectors = separation(this.rects, initial ? 5 : this.separation, this.rectCenter.clone());
    const cohVectors = cohesion(this.rects, this.cohesion, this.rectCenter.clone());

    const totalMovementAmt = sepVectors.reduce((sum, v) => sum + v.magnitude(), 0);
    if (this.autoGen && totalMovementAmt === 0) {
      this.running = false;
    }

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
    if (!this.drawing) {
      return;
    }
    requestAnimationFrame(() => this.draw(this.rects));
  }

  getRect = () => {
    const center = [~~(this.width / 2), ~~(this.height / 2)];
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
 
    forEachTriangleEdge(this.rects.filter(r => r.final), this.del, (e: number, p: MovableRect, q: MovableRect) => {
      this.roomGraph.setEdge(p.id, q.id);
    });
    if (!this.drawing) {
      return;
    }
    requestAnimationFrame(() => {
      this.draw(this.rects);
      this.drawDel(this.del);
    });
  }

  edgeWeight = rooms => ({ v, w }) => {
    const V = rooms[v];
    const W = rooms[w];
    return (new Vector(V.x, V.y)).distance(new Vector(W.x, W.y));
  }

  generateMSTGraph = () => {
    requestAnimationFrame(() => this.draw(this.rects));
    const rooms = this.rects.reduce((acc, room) => {
      return {
        ...acc,
        [room.id]: room
      }
    }, {});
    this.MSTGraph = alg.prim(this.roomGraph, this.edgeWeight(rooms));
    if (!this.drawing) {
      return;
    }
    requestAnimationFrame(() => {
      this.drawDel(this.del);
      this.drawMST(this.MSTGraph);
    })
  }

  addCycles = () => {
    requestAnimationFrame(() => { if (this.drawing) this.drawDel(this.del) });
    const rooms = this.rects.reduce((acc, room) => {
      return {
        ...acc,
        [room.id]: room
      }
    }, {});
    const finalRooms = this.rects.filter(r => r.final);
    const edgesToAddBack = Math.floor((this.roomGraph.edges().length - this.MSTGraph.edges().length) * this.cycleEdgePct);
    let i = 0;
    while (i <= edgesToAddBack) {
      const edge = RNG.getItem(this.roomGraph.edges());
      if (!this.MSTGraph.hasEdge(edge)) {
        const { v, w } = edge;
        this.MSTGraph.setEdge(v, w);
        i++;
      }
    }
    if (!this.drawing) {
      return;
    } 
    requestAnimationFrame(() => this.drawMST(this.MSTGraph));
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
    if (!graph) { return; }
    const color = '#FF00FF';
    const rooms = this.rects.reduce((acc, room) => {
      return {
        ...acc,
        [room.id]: room
      }
    }, {});
    if (!this.drawing) {
      return;
    }
    const ctx = this.canvas.getContext('2d');
    this.MSTGraph.edges().forEach(edge => {
      const { v, w } = edge;
      this.drawLine(ctx, color, 2)(rooms[v], rooms[w]);
    });
  }

  createCorridor = (a, b) => {
    const room = new Vector(a.x, a.y);
    const other = new Vector(b.x, b.y);
    const corner1 = new Vector(a.x, b.y);
    const corner2 = new Vector(b.x, a.y);

    const corner = RNG.getItem([corner1, corner2]);
    const segments = [[room, corner], [corner, other]];

    return segments;
  }

  drawCorridors = (corridors: Vector[][]) => {
    if (!this.drawing) {
      return;
    }
    requestAnimationFrame(() => this.draw(this.rects));
    const ctx = this.canvas.getContext('2d');
    const color = 'rgba(255, 100, 100, 0.5)';
    const draw = this.drawLine(ctx, color, 3);

    for (const corridor of corridors) {
      const [seg1, seg2] = corridor;
      requestAnimationFrame(() => {
        draw(seg1, seg2);
      });
    }
  } 

  createCorridors = () => {
    const rooms = this.rects.reduce((acc, room) => {
      return {
        ...acc,
        [room.id]: room
      }
    }, {});
    this.corridors = [];

    const finalRooms = this.rects.filter(r => r.final);
    let ctx, color;
    if (this.drawing) {
      ctx = this.canvas.getContext('2d');
      color = 'rgba(100, 255, 100, 0.75)';
    }
    
    this.MSTGraph.edges().forEach(edge => {
      const { v, w } = edge;
      if (this.drawing) this.drawLine(ctx, color, 2)(rooms[v], rooms[w]);
      this.corridors = this.corridors.concat(this.createCorridor(rooms[v], rooms[w]));
    });
    for (const corridor of this.corridors) {
      for (let idx = 0; idx < this.rects.length; idx++) {
        const rect = this.rects[idx];
        const intersects = (
          doLinesIntersect(
            new Vector(rect.x - rect.w / 2, rect.y - rect.h / 2),
            new Vector(rect.x + rect.w / 2, rect.y - rect.h / 2),
            corridor[0], corridor[1]
          ) || doLinesIntersect(
            new Vector(rect.x - rect.w / 2, rect.y + rect.h / 2),
            new Vector(rect.x + rect.w / 2, rect.y + rect.h / 2),
            corridor[0], corridor[1]
          ) || doLinesIntersect(
            new Vector(rect.x - rect.w / 2, rect.y - rect.h / 2),
            new Vector(rect.x - rect.w / 2, rect.y + rect.h / 2),
            corridor[0], corridor[1]
          ) || doLinesIntersect(
            new Vector(rect.x + rect.w / 2, rect.y - rect.h / 2),
            new Vector(rect.x + rect.w / 2, rect.y + rect.h / 2),
            corridor[0], corridor[1]
          )
        );
        if (intersects) {
          this.rects[idx] = { ...rect, final: true };
        }
      }
    }
    if (!this.drawing) {
      return;
    }
    requestAnimationFrame(() => this.draw(this.rects));
    this.drawCorridors(this.corridors);
  }

  setState = (newState: MapGenState) => {
    if (newState === MapGenState.PRERUN) {
      this.running = true;
      this.done = false;
      this.del = undefined;
      clearInterval(this.drawingInterval);
      RNG.setSeed(this.seed);
      this.rects = [];
      this.corridors = [];
      if (this.drawing) this.draw(this.rects);
      if (this.autoGen) {
        this.setState(MapGenState.CREATE_RECTS);
      }
    } else if (newState === MapGenState.CREATE_RECTS) {
      for (let i = 1; i <= this.numRects; i++) {
        this.rects.push(this.getRect());
      }
      const boundingRect = this.rects.reduce((acc, rect) => {
        return {
          l: ~~(Math.min(rect.x - rect.w / 2, acc.l)),
          t: ~~(Math.min(rect.y - rect.h / 2, acc.t)),
          r: ~~(Math.max(rect.x + rect.w / 2, acc.r)) + 1,
          b: ~~(Math.max(rect.y + rect.h / 2, acc.b)) + 1,
        }
      }, {l: Infinity, t: Infinity, r: -Infinity, b: -Infinity});
      this.rectCenter = new Vector(this.width / 2, this.height / 2); 
      if (this.drawing) this.draw(this.rects);
      if (this.autoGen) {
        this.setState(MapGenState.SEPARATION);
      }
    } else if (newState === MapGenState.SEPARATION) {
      this.step(true); 
      if (this.drawing) this.draw(this.rects);
      this.drawingInterval = setInterval(() => {
        if (this.running) {
          this.step();
        } else if(this.autoGen) {
          this.setState(MapGenState.CLEANUP);
        }
      }, FPS);
    } else if (newState === MapGenState.CLEANUP) {
      clearInterval(this.drawingInterval);
      this.running = false;
      this.done = true;
      this.cleanUpRooms();
      this.findRooms(); 
      if (this.drawing) this.draw(this.rects);
      if (this.autoGen) {
        this.setState(MapGenState.DELAUNAY);
      }
    } else if (newState === MapGenState.DELAUNAY) { 
      this.generateRoomGraph();
      if (this.autoGen) {
        this.setState(MapGenState.MST);
      }
    } else if (newState === MapGenState.MST) {
      this.generateMSTGraph();
      if (this.autoGen) {
        this.setState(MapGenState.CYCLES);
      }
    } else if (newState === MapGenState.CYCLES) {
      this.addCycles();
      if (this.autoGen) {
        this.setState(MapGenState.CORRIDORS);
      }
    } else if (newState === MapGenState.CORRIDORS) {
      this.createCorridors();
      this.finish();
    }

    this.state = newState; 

    if (this.loadingCallback) {
      this.loadingCallback(newState, MapGenStateIdx[newState], Object.keys(MapGenStateIdx).length)
    }
  }

  finish = () => {
    const output = {
      rooms: this.rects.filter(r => r.final).map(r => ({ x: r.x, y: r.y, w: r.w, h: r.h, id: r.id })),
      corridors: this.corridors.map(([v, w]) => ([{ x: v.x, y: v.y }, { x: w.x, y: w.y }])),
      graph: this.MSTGraph
    }
    this.doneCallback(output);

  }

  restart = (): void => {
    this.setState(MapGenState.PRERUN);
  }
}
eval('window.MapGen = MapGen');
 
