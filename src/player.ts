import keymage from 'keymage';
import { RunState } from './state';
import { Position } from './ecs/components';
import { CellType, xyIdx, isBlocked } from './map';

type Direction = 'N' | 'E' | 'S' |'W';

const tryMove = (dir: Direction) => (game) => (): void => {
  const { map, runState } = game.getState(state => ({ runState: state.runState, map: state.map }));
  const player = game.ecs.entityManager._entities.find(e => e.id === game.playerID);
  if (runState !== RunState.AWAITINGINPUT) { return; }

  const dirs = {
    N: [0, -1],
    E: [1, 0],
    S: [0, 1],
    W: [-1, 0]
  };
  const [dx, dy] = dirs[dir];
  const position = player.getComponent(Position);
  const { x, y } = position;
  const destinationIdx = xyIdx(x + dx, y + dy);

  if (!isBlocked(map, destinationIdx)) {
    position.x += dx;
    position.y += dy;
  }
};

const setupKeys = (game): void => {
  keymage('k', tryMove('N')(game));
  keymage('l', tryMove('E')(game));
  keymage('j', tryMove('S')(game));
  keymage('h', tryMove('W')(game));
};

export default setupKeys;
