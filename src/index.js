import './lib/canvas';
import get from 'lodash/get';
import sample from 'lodash/sample';
import times from 'lodash/times';
import { grid, pxToCell } from './lib/canvas';
import { toLocId } from './lib/grid';
import { readCacheSet } from './state/cache';
import { createDungeon } from './lib/dungeon';
import { fov } from './systems/fov';
import { ai } from './systems/ai';
import { movement } from './systems/movement';
import { render } from './systems/render';
import ecs from './state/ecs';
import {
  Move,
  Position,
} from './state/components';

const dungeon = createDungeon({
  x: grid.map.x,
  y: grid.map.y,
  width: grid.map.width,
  height: grid.map.height,
});

const player = ecs.createPrefab('Player');
player.add(Position, {
  x: dungeon.rooms[0].center.x,
  y: dungeon.rooms[0].center.y,
});

const openTiles = Object.values(dungeon.tiles).filter(
  x => x.sprite === 'FLOOR'
);

times(5, () => {
  const tile = sample(openTiles);

  ecs.createPrefab('Goblin')
    .add(Position, { x: tile.x, y: tile.y });
});

fov(player);
render();

let userInput = null;
let playerTurn = true;
document.addEventListener('keydown', event => {
  userInput = event.key;
});

const processUserInput = () => {
  if (userInput == "k") {
    player.add(Move, { x: 0, y: -1 });
  }

  if (userInput == "j") {
    player.add(Move, { x: 0, y: 1 });
  }

  if (userInput == "h") {
    player.add(Move, { x: -1, y: 0 });
  }

  if (userInput == "l") {
    player.add(Move, { x: 1, y: 0 });
  }

  userInput = null;
};

const update = () => {
  if (player.isDead) {
    return;
  }
  if (playerTurn && userInput) {
    processUserInput();
    movement();
    fov(player);
    render();

    playerTurn = false;
  }

  if (!playerTurn) {
    ai(player);
    movement();
    fov(player);
    render();

    playerTurn = true;
  }
};

const gameLoop = () => {
  update();
  requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);

if (process.env.NODE_ENV === "development") {
  const canvas = document.querySelector('.main');

  canvas.onclick = e => {
    const [x, y] = pxToCell(e);
    const locId = toLocId({ x, y });

    readCacheSet('entitiesAtLocation', locId).forEach(eId => {
      const entity = ecs.getEntity(eId);

      console.log(
        `${get(entity, 'appearance.char', '?')} ${get(
          entity,
          'description.name',
          '?'
        )}`, entity
      );
    });
  };
}
