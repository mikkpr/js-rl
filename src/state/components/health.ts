import { BaseComponent } from 'ecs-machina';

export interface Health extends BaseComponent {
  maxHealth: number;
  health: number;
  dead: boolean;
  lastAttacker?: string;
}

export const Health = 'Health';

export const isHealth = (cmp: BaseComponent): cmp is Health => {
  return cmp._type === Health;
}
