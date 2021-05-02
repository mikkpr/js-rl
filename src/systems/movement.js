import ecs from '../state/ecs';
import {
  addCacheSet,
  deleteCacheSet,
  readCacheSet,
} from '../state/cache';
import { grid } from '../lib/canvas';
import { Move } from '../state/components';

const movableEntities = ecs.createQuery({
  all: [Move],
});

export const movement = () => {
  movableEntities.get().forEach((entity, ...args) => {
    let mx = entity.position.x + entity.move.x;
    let my = entity.position.y + entity.move.y;

    // observe map boundaries
    mx = Math.min(grid.map.width + grid.map.x - 1, Math.max(21, mx));
    my = Math.min(grid.map.height + grid.map.y - 1, Math.max(3, my));

    // check for blockers
    const blockers = [];
    // read from cache
    const entitiesAtLoc = readCacheSet("entitiesAtLocation", `${mx},${my}`);

    for (const eId of entitiesAtLoc) {
      if (ecs.getEntity(eId).isBlocking) {
        blockers.push(eId);
      }
    }

    if (blockers.length) {
      entity.remove(entity.move);
      return;
    }

    deleteCacheSet(
      "entitiesAtLocation",
      `$(entity.position.x},${entity.position.y}`,
      entity.id,
    );
    addCacheSet("entitiesAtLocation", `${mx},${my}`, entity.id);

    entity.position.x = mx;
    entity.position.y = my;

    entity.remove(entity.move);
  });
};
