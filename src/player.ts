import keymage from 'keymage';
import { RunState } from './state';
import { Position, Viewshed } from './ecs/components';
import { CellType, xyIdx, isPassable } from './map';

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
    position.x += dx;
    position.y += dy;
    const viewshed = player.getMutableComponent(Viewshed);
    viewshed.dirty = true;
  }

  game.setState(state => { state.runState = RunState.PLAYERTURN; });
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
};

export default setupKeys;
