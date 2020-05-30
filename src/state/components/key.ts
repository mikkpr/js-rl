import { BaseComponent } from 'ecs-machina';

export interface Key extends BaseComponent {
  doorIdx?: number;
}

export const Key = 'Key';

export const isKey = (cmp: BaseComponent): cmp is Key => {
  return cmp._type === Key;
}
