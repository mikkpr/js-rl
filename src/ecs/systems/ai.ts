import * as ROT from 'rot-js';
import { System } from 'ecsy';
import { Position, Monster, Viewshed } from '../components';
import { display } from '../..';
import { drawMap } from '../../display';
import { xyIdx, isPassable } from '../../map';
import { game } from '../..';

class AISystem extends System {
  display: ROT.Display;

  execute(delta: number, time: number): void {
    const player = game.player;
    const map = game.getState().map;
    const playerPos = player.getComponent(Position);
    const playerIdx = xyIdx(playerPos.x, playerPos.y);
    const astar = new ROT.Path.AStar(
      playerPos.x,
      playerPos.y,
      (x, y) => isPassable(map, xyIdx(x, y)),
      { topology: 4 }
    )

    this.queries.monsters.results.forEach(mob => {
      const viewshed = mob.getMutableComponent(Viewshed);
      if (viewshed.visibleTiles.has(playerIdx)) {
        const position = mob.getMutableComponent(Position);
        const path = [];
        astar.compute(position.x, position.y, (x, y) => path.push([x, y]));
        if (path[1] && !(path[1][0] === playerPos.x && path[1][1] === playerPos.y)) {
          position.x = path[1][0];
          position.y = path[1][1];
          viewshed.dirty = true;
        }
      }
    });
  }
}

AISystem.queries = {
  monsters: { components: [ Monster, Position, Viewshed ]}
};

export default AISystem;
