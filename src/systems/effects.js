import ecs from '../state/ecs';
import { ActiveEffects } from '../state/components';

const activeEffectsEntities = ecs.createQuery({
  all: [ActiveEffects],
});

export const effects = () => {
  activeEffectsEntities.get().forEach(entity => {
    entity.activeEffects.forEach(c => {
      if (entity[c.component]) {
        entity[c.component].current += c.delta;

        if (entity[c.component].current > entity[c.component].max) {
          entity[c.component].current = entity[c.component].max;
        }
      }

      entity.remove(c);
    });
  });
};
