import './lib/canvas';
import { grid } from './lib/canvas';
import { createDungeon } from './lib/dungeon';
import { fov } from './systems/fov';
import { movement } from './systems/movement';
import { render } from './systems/render';
import { player } from './state/ecs';
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
player.add(Position, {
  x: dungeon.rooms[0].center.x,
  y: dungeon.rooms[0].center.y,
});

fov();
render();

let userInput = null;
document.addEventListener('keydown', event => {
  userInput = event.key;
  processUserInput();
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

  movement();
  fov();
  render();
};
