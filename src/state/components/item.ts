import { BaseComponent } from 'ecs-machina';

export interface Item extends BaseComponent {
  weight: number;
}

export const Item = 'Item';

export const isItem = (cmp: BaseComponent): cmp is Item => {
  return cmp._type === Item;
}
