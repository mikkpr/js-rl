import { BaseComponent } from 'ecs-machina';

export interface Name extends BaseComponent {
  name: string;
}

export const Name = 'Name';

export const isName = (cmp: BaseComponent): cmp is Name => {
  return cmp._type === Name;
}
