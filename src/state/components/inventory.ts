import { BaseComponent } from 'ecs-machina';

export interface Inventory extends BaseComponent {
  contents: string[];
  capacity: number;
}

export const Inventory = 'Inventory';

export const isInventory = (cmp: BaseComponent): cmp is Inventory => {
  return cmp._type === Inventory;
}
