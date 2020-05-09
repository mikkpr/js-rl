import keymage from 'keymage';
import { RunState } from './state';
import { Light, Position, Viewshed } from './ecs/components';
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

  game.setState(state => { state.runState = RunState.PLAYERTURN; });
};

const idclip = () => {
  window.clairvoyance = !(window.clairvoyance);
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

const setupKeys = (game): void => {
  keymage('k', tryMove('N')(game));
  keymage('up', tryMove('N')(game));
  keymage('l', tryMove('E')(game));
  keymage('right', tryMove('E')(game));
  keymage('j', tryMove('S')(game));
  keymage('down', tryMove('S')(game));
  keymage('h', tryMove('W')(game));
  keymage('left', tryMove('W')(game));
  keymage('i d c l i p', idclip);
  keymage('t', toggleLight);
};

export default setupKeys;
