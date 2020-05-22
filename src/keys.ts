import keymage from 'keymage';
import { RunState } from './state';
import { Light, Position, Viewshed } from './ecs/components';
import { VisibilitySystem } from './ecs/systems';
import { getNeighborScores, CellType, xyIdx, isPassable } from './map';
import { game } from '.';

type Direction = 'N' | 'E' | 'S' |'W';

const tryMove = (dir: Direction) => (game) => (): void => {
  const { map, runState } = game.getState(state => ({ runState: state.runState, map: state.map }));
  const player = game.player;
  if (runState !== RunState.AWAITINGINPUT) { return; }

  const dirs = {
    N: [0, -1],
    E: [1, 0],
    S: [0, 1],
    W: [-1, 0]
  };
  const [dx, dy] = dirs[dir];
  const position = player.getMutableComponent(Position);
  const { x, y } = position;
  const destinationIdx = xyIdx(x + dx, y + dy);
  if (isPassable(map, destinationIdx)) {
    game.cameraOffset[0] -= dx;
    game.cameraOffset[1] -= dy;
    position.x += dx;
    position.y += dy;
    const viewshed = player.getMutableComponent(Viewshed);
    if (viewshed) viewshed.dirty = true;
    const light = player.getMutableComponent(Light);
    if (light) light.dirty = true;
  }

  game.setState(state => {
    state.runState = RunState.PLAYERTURN;
    state.hoveredTileIdx = null;
  });
};

const debug = () => {
  console.log('?')
  window.DEBUG = !(window.DEBUG);
};

const toggleLight = () => {
  const player = game.player;
  if (player.hasComponent(Light)) {
    player.removeComponent(Light);
  } else {
    player.addComponent(Light, { range: 20, color: [255, 255, 225] });
  }
  game.render(0, game.lastTime);
};

const dwim = () => {
  const map = game.getState().map;
  const pos = game.player.getComponent(Position);

  const cardinalNeighbors = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
  ];
  for (const N of cardinalNeighbors) {
    const idx = xyIdx(pos.x + N[0], pos.y + N[1]);
    if (idx in map) {
      if (map[idx] === CellType.DOOR_CLOSED) {
        game.setState(state => {
          state.map[idx] = CellType.DOOR_OPEN;
        });
        game.player.getMutableComponent(Viewshed).dirty = true;
        const light = game.player.getMutableComponent(Light);
        if (light) game.player.getMutableComponent(Light).dirty = true;
        break;
      } else if (map[idx] === CellType.DOOR_OPEN) {
        game.setState(state => {
          state.map[idx] = CellType.DOOR_CLOSED;
        });
        game.player.getMutableComponent(Viewshed).dirty = true;
        const light = game.player.getMutableComponent(Light);
        if (light) game.player.getMutableComponent(Light).dirty = true;
        break;
      }
    }
  }
  game.ecs.getSystem(VisibilitySystem).execute(0, game.lastTime)
};

const toggleMinimap = () => {
  game.setState(state => { state.minimapVisible = !state.minimapVisible; })
  game.render(0, game.lastTime);
};

const toggleHelp = () => {
  const help: HTMLElement = document.querySelector('.help');
  if (help.style.display !== 'none') {
    help.style.display = 'none';
  } else {
    help.style.display = 'block';
  }
}

const handleMouseUp = e => {
  e.preventDefault();
  e.stopPropagation();
  console.log('?')
}

const setupKeys = (game): void => {
  keymage('shift-d shift-e shift-b shift-u shift-g', debug);
  keymage('k', tryMove('N')(game));
  keymage('up', tryMove('N')(game));
  keymage('w', tryMove('N')(game));
  keymage('l', tryMove('E')(game));
  keymage('right', tryMove('E')(game));
  keymage('d', tryMove('E')(game));
  keymage('j', tryMove('S')(game));
  keymage('down', tryMove('S')(game));
  keymage('s', tryMove('S')(game));
  keymage('h', tryMove('W')(game));
  keymage('left', tryMove('W')(game));
  keymage('a', tryMove('W')(game));
  keymage('t', toggleLight);
  keymage('space', dwim);
  keymage('m', toggleMinimap);
  keymage('shift-f1', toggleHelp);

  document.querySelector('.main-container canvas').addEventListener('mouseup', handleMouseUp)

};

export default setupKeys;
