import * as ROT from 'rot-js';
import setupKeys from './keys';
import { World } from 'ecsy';
import throttle from 'lodash/throttle';

import GameState, { RunState } from './state';
import { setupDisplay, setupMinimap } from './display';
import { xyIdx, createNewMap2 } from './map';

import {
  AISystem,
  RenderingSystem,
  VisibilitySystem,
  InfoSystem
} from './ecs/systems';
import { createPlayer, createOrc, createLight } from './ecs/entities';
import { Name, Light, Renderable, Viewshed, Position, Monster } from './ecs/components';

import './assets/VGA8x16.png';
import './assets/ibm_vga8.eot';
import './assets/ibm_vga8.woff';
import './assets/ibm_vga8.woff2';
import './assets/ibm_vga8.ttf';
import './assets/main.css';

declare global {
  interface Window {
    DEBUG?: boolean;
    game?: GameState;
  }

  type Color = [number, number, number];
}

const WIDTH = 64;
const HEIGHT = 32;
const MAPWIDTH = 64;
const MAPHEIGHT = 64;

export const TILEWIDTH = 8;
export const TILEHEIGHT = 16;

let display;
let minimap;
let ECS;
let map;
let game;
let player;

const main = async (): Promise<any> => {
  ECS = new World();
  ECS.registerComponent(Position);
  ECS.registerComponent(Viewshed);
  ECS.registerComponent(Renderable);
  ECS.registerComponent(Monster);
  ECS.registerComponent(Light);
  ECS.registerComponent(Name);

  ECS.registerSystem(VisibilitySystem);
  ECS.registerSystem(AISystem);
  ECS.registerSystem(RenderingSystem);
  ECS.registerSystem(InfoSystem);

  display = setupDisplay({
    width: WIDTH,
    height: HEIGHT
  });
  minimap = setupMinimap({
    width: MAPWIDTH,
    height: MAPHEIGHT,
  });
  map = await createNewMap2(MAPWIDTH, MAPHEIGHT);
  document.querySelector('.loading').remove();
  const handleCanvasMouseMove = throttle((e) => {
    if (display.getContainer().contains(e.target)) {
      const { layerX, layerY } = e;
      const X = ~~(layerX / 512 * WIDTH) - game.cameraOffset[0];
      const Y = ~~(layerY / 512 * HEIGHT) - game.cameraOffset[1];
      if (X < 0 || Y < 0 || X >= MAPWIDTH || Y >= MAPHEIGHT) { return; }
      const tileIdx = xyIdx(X, Y);
      game.setState(state => { state.hoveredTileIdx = tileIdx; });
    }
  }, 30);

  game = new GameState({
    runState: RunState.PRERUN,
    map: map.map,
    rooms: map.rooms,
    centers: map.centers,
    scores: map.scores,
    minimapVisible: false
  }, display, ECS);
  eval('window.game = game;');

  document.addEventListener('mousemove', handleCanvasMouseMove);

  const randomCenter = ROT.RNG.getItem(map.centers);
  const mapCenter = [~~(WIDTH/2), ~~(HEIGHT/2)];
  const cameraOffset: [number, number] = [mapCenter[0] - randomCenter[0], mapCenter[1] - randomCenter[1]];

  createPlayer(ECS, randomCenter[0], randomCenter[1]);
  player = (game.ecs as any).entityManager.getEntityByName('player');
  game.player = player;
  game.cameraOffset = cameraOffset;

  const randomCenter2 = ROT.RNG.getItem(map.centers);
  createOrc(ECS, randomCenter2[0], randomCenter2[1]);

  const numLights = ROT.RNG.getUniformInt(3, map.centers.length);
  for (let n = 3; n < numLights; n++) {
    const range = ROT.RNG.getUniformInt(5, 10);
    const color: Color = ROT.RNG.getItem([
      [255, 200, 200],
      [200, 255, 200],
      [200, 200, 255],
      [255, 255, 200],
      [200, 255, 255],
      [255, 200, 255]
    ]);
    const c = ROT.RNG.getItem(map.centers);
    createLight(ECS, c[0] + 1, c[1], range, color);
  }

  setupKeys(game);

  game.setState(state => { state.runState = RunState.PRERUN; });

  game.gameLoop();

  game.player.getMutableComponent(Viewshed).dirty = true;
  const light = game.player.getMutableComponent(Light);
  if (light) game.player.getMutableComponent(Light).dirty = true;

};

eval('window.main = main;');

export {
  game,
  ECS,
  display,
  minimap,
  player,
  WIDTH,
  HEIGHT,
  MAPWIDTH,
  MAPHEIGHT,
};

