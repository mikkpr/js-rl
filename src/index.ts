import * as ROT from 'rot-js';
import setupKeys from './player';
import { World } from 'ecsy';
import throttle from 'lodash/throttle';

import GameState, { RunState } from './state';
import { setupDisplay } from './display';
import { xyIdx, createMap } from './map';

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
    clairvoyance?: boolean;
    game?: GameState;
  }

  type Color = [number, number, number];
}

const WIDTH = 64;
const HEIGHT = 32;
const MAPWIDTH = WIDTH * 2;
const MAPHEIGHT = HEIGHT * 2;

const TILEWIDTH = 8;
const TILEHEIGHT = 16;

const display = setupDisplay({
  width: WIDTH,
  height: HEIGHT
});

const ECS = new World();

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

const map = createMap(MAPWIDTH, MAPHEIGHT);

const game = new GameState({
  runState: RunState.PRERUN,
  map: map.map,
  rooms: map.rooms,
  centers: map.centers,
  scores: map.scores
}, display, ECS);

eval('window.game = game;');
const handleCanvasMouseMove = throttle((e) => {
  if (display.getContainer().contains(e.target)) {
    const { layerX, layerY } = e;
    const X = ~~(layerX / 512 * WIDTH) - game.cameraOffset[0];
    const Y = ~~(layerY / 512 * HEIGHT) - game.cameraOffset[1];
    const tileIdx = xyIdx(X, Y);
    game.setState(state => { state.hoveredTileIdx = tileIdx; });
  }
}, 30)

document.addEventListener('mousemove', handleCanvasMouseMove);
const main = (): void => {
  const randomCenter = ROT.RNG.getItem(map.centers);
  const mapCenter = [~~(WIDTH/2), ~~(HEIGHT/2)];
  const cameraOffset: [number, number] = [mapCenter[0] - randomCenter[0], mapCenter[1] - randomCenter[1]];

  createPlayer(ECS, randomCenter[0], randomCenter[1]);
  game.player = (game.ecs as any).entityManager.getEntityByName('player');
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

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.main .loading').remove();
  main();
});

export { game, ECS, display, WIDTH, HEIGHT, MAPWIDTH, MAPHEIGHT };
