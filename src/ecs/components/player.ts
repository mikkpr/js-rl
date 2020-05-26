import { BaseComponent } from 'ecs-machina';

export interface Player extends BaseComponent {}

export const Player = 'Player';

export const isPlayer = (cmp: BaseComponent): cmp is Player => {
  return cmp._type === Player;
}
