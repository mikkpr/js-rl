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
import { effects } from './systems/effects';
import { render } from './systems/render';
import ecs, { addLog } from './state/ecs';
import {
  Move,
  Position,
  ActiveEffects,
  Effects,
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

times(5, () => {
  const tile = sample(openTiles);
  ecs.createPrefab('HealthPotion')
    .add(Position, { x: tile.x, y: tile.y });
});

fov(player);
render(player);

let userInput = null;
let playerTurn = true;
export let gameState = "GAME";
export let selectedInventoryIndex = 0;
document.addEventListener('keydown', event => {
  userInput = event.key;
});

const processUserInput = () => {
  if (gameState === 'GAME') {
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

    if (userInput === "g") {
      let pickupFound = false;
      readCacheSet("entitiesAtLocation", toLocId(player.position)).forEach(
        (eId) => {
          const entity = ecs.getEntity(eId);
          if (!pickupFound && entity.isPickup) {
            pickupFound = true;
            player.fireEvent("pick-up", entity);
            addLog(`You pickup a ${entity.description.name}`);
          }
        }
      );
      if (!pickupFound) {
        addLog("There is nothing to pick up here");
      }
    }

    if (userInput === 'i') {
      gameState = 'INVENTORY';
    }

    userInput = null;
  }

  if (gameState === 'INVENTORY') {
    if (userInput === 'i' || userInput === 'Escape') {
      gameState = 'GAME';
    }

    if (userInput === 'k') {
      selectedInventoryIndex -= 1;
      if (selectedInventoryIndex < 0) selectedInventoryIndex = 0;
    }

    if (userInput === 'j') {
      selectedInventoryIndex += 1;
      if (selectedInventoryIndex > player.inventory.list.size - 1) {
        selectedInventoryIndex = Math.max(0, player.inventory.list.size - 1);
      }
    }

    if (userInput === 'c') {
      const entity = ecs.getEntity(Array.from(player.inventory.list.keys())[selectedInventoryIndex]);
      if (entity) {
        if (entity.has(Effects)) {
          entity
            .effects
            .forEach(x => player.add(ActiveEffects, { ...x.serialize() }));
        }

        addLog(`You consume a ${entity.description.name}`);
        player.fireEvent('consume', entity);
        entity.destroy();

        if (selectedInventoryIndex > player.inventory.list.size - 1) {
          selectedInventoryIndex = Math.max(0, player.inventory.list.size - 1);
        }
      }

    }

    if (userInput === "d") {
      if (player.inventory.list.size) {
        const entity = ecs.getEntity(Array.from(player.inventory.list.keys())[selectedInventoryIndex]);
        player.fireEvent("drop", entity);
        addLog(`You drop a ${entity.description.name}`);
      }
    }

    userInput = null;
  }
};

const update = () => {
  if (player.isDead) {
    return;
  }
  if (playerTurn && userInput && gameState === 'INVENTORY') {
    processUserInput();
    effects();
    render(player);
    playerTurn = true;
  }

  if (playerTurn && userInput && gameState === 'GAME') {
    processUserInput();
    effects();
    movement();
    fov(player);
    render(player);

    if (gameState === 'GAME') {
      playerTurn = false;
    }
  }

  if (!playerTurn) {
    ai(player);
    effects();
    movement();
    fov(player);
    render(player);

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
