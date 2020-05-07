import * as ROT from 'rot-js';
import { System } from 'ecsy';
import { Position, Monster, Viewshed } from '../components';
import { display } from '../..';
import { drawMap } from '../../display';
import { xyIdx } from '../../map';
import { game } from '../..';

class AISystem extends System {
  display: ROT.Display;

  execute(delta: number, time: number): void {
    const player = game.player;
    const playerPos = player.getComponent(Position);
    const playerIdx = xyIdx(playerPos.x, playerPos.y);

    this.queries.monsters.results.forEach(mob => {
      const viewshed = mob.getComponent(Viewshed);
      if (viewshed.visibleTiles.includes(playerIdx)) {
        console.log(mob['name'], 'exclaims!');
      }
    });
  }
}

AISystem.queries = {
  monsters: { components: [ Monster, Position, Viewshed ]}
};

export default AISystem;
