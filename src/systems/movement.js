import ecs from '../state/ecs';
import {
  addCacheSet,
  deleteCacheSet,
  readCacheSet,
} from '../state/cache';
import { grid } from '../lib/canvas';
import {
  Move,
  Health,
  Defense,
  Ai,
  IsBlocking,
  Layer300,
  Layer400,
  IsDead,
} from '../state/components';

const movableEntities = ecs.createQuery({
  all: [Move],
});

const attack = (entity, target) => {
  const damage = entity.power.current - target.defense.current;
  target.fireEvent('take-damage', { amount: damage });

  if (target.health.current <= 0) {
    kill(target);

    return console.log(
      `${entity.description.name} kicked a ${target.description.name} for ${damage} damage and killed it!`
    );
  }
  console.log(`${entity.description.name} kicked a ${target.description.name} for ${damage} damage!`);
}

const kill = entity => {
  entity.appearance.char = "%";
  if (entity.has(IsBlocking)) entity.remove(entity.isBlocking)
  if (entity.has(Ai)) entity.remove(entity.ai)
  if (entity.has(Layer400)) entity.remove(entity.layer400)
  entity.add(Layer300);
  entity.add(IsDead);
}

export const movement = () => {
  movableEntities.get().forEach((entity, ...args) => {
    let mx = entity.move.x;
    let my = entity.move.y;

    if (entity.move.relative) {
      mx = entity.position.x + entity.move.x;
      my = entity.position.y + entity.move.y;
    }

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
      blockers.forEach(eId => {
        const target = ecs.getEntity(eId);
        if (target.has(Health) && target.has(Defense)) {
          attack(entity, target);
        } else {
          console.log(`${entity.description.name} bumped into a ${target.description.name}`);
        }
      });
      entity.remove(entity.move);
      return;
    }

    deleteCacheSet(
      "entitiesAtLocation",
      `${entity.position.x},${entity.position.y}`,
      entity.id,
    );
    addCacheSet("entitiesAtLocation", `${mx},${my}`, entity.id);

    entity.position.x = mx;
    entity.position.y = my;

    entity.remove(entity.move);
  });
};
