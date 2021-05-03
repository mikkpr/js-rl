import ecs from '../state/ecs';
import { Ai, Description, IsInFov, Move } from '../state/components';
import { aStar } from '../lib/pathfinding';

const aiEntities = ecs.createQuery({
  all: [Ai, Description]
});

const movetoTarget = (entity, target) => {
  const path = aStar(entity.position, target.position);
  if (path.length) {
    const newLoc = path[1];
    if (!newLoc) { return; }
    entity.add(Move, { x: newLoc[0], y: newLoc[1], relative: false });
  }
};

export const ai = (player) => {
  aiEntities.get().forEach(entity => {
    if (entity.has(IsInFov)) {
      movetoTarget(entity, player);
    }
  });
};
