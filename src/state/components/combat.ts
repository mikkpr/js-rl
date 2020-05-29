import { BaseComponent } from 'ecs-machina';

export interface MeleeCombat extends BaseComponent {
  damage: number | string;
  verb: string;
}

export const MeleeCombat = 'MeleeCombat';

export const isMeleeCombat = (cmp: BaseComponent): cmp is MeleeCombat => {
  return cmp._type === MeleeCombat;
}
