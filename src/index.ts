import * as ROT from 'rot-js';
import setupKeys from './player';
import { World } from 'ecsy';

import GameState, { RunState } from './state';
import { setupDisplay } from './display';
import { createMap } from './map';

import {
  AISystem,
  RenderingSystem,
  VisibilitySystem
} from './ecs/systems';
import { createPlayer, createOrc } from './ecs/entities';
import { Light, Renderable, Viewshed, Position, Monster } from './ecs/components';

import './assets/VGA8x16.png';
import './assets/ibm_vga8.eot';
import './assets/ibm_vga8.woff';
import './assets/ibm_vga8.woff2';
import './assets/ibm_vga8.ttf';

declare global {
  interface Window {
    clairvoyance?: boolean;
    game?: GameState;
  }
}

const WIDTH = 64;
const HEIGHT = 32;
const MAPWIDTH = WIDTH * 2;
const MAPHEIGHT = HEIGHT * 2;

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

ECS.registerSystem(RenderingSystem);
ECS.registerSystem(VisibilitySystem);
ECS.registerSystem(AISystem);

const map = createMap(MAPWIDTH, MAPHEIGHT);

const game = new GameState({
  runState: RunState.PRERUN,
  map: map.map,
  rooms: map.rooms,
  centers: map.centers,
  scores: map.scores
}, display, ECS);

eval('window.game = game;');

const main = (): void => {
  const randomCenter = ROT.RNG.getItem(map.centers);
  const mapCenter = [~~(WIDTH/2), ~~(HEIGHT/2)];
  const cameraOffset: [number, number] = [mapCenter[0] - randomCenter[0], mapCenter[1] - randomCenter[1]];

  createPlayer(ECS, randomCenter[0], randomCenter[1]);
  game.player = (game.ecs as any).entityManager.getEntityByName('player');
  game.cameraOffset = cameraOffset;

  const randomCenter2 = ROT.RNG.getItem(map.centers);
  createOrc(ECS, randomCenter2[0], randomCenter2[1]);

  setupKeys(game);

  game.setState(state => { state.runState = RunState.PRERUN; });

  game.gameLoop();
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.main .loading').remove();
  main();
});

export { game, ECS, display, WIDTH, HEIGHT, MAPWIDTH, MAPHEIGHT };
