import { BaseComponent } from 'ecs-machina';

export interface Body extends BaseComponent {
  solid: boolean;
  weight?: number;
}

export const Body = 'Body';

export const isBody = (cmp: BaseComponent): cmp is Body => {
  return cmp._type === Body;
}
