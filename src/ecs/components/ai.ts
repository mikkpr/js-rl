import { BaseComponent } from 'ecs-machina';

export interface AI extends BaseComponent {
  ai: string;
}

export const AI = 'AI';

export const isAI = (cmp: BaseComponent): cmp is AI => {
  return cmp._type === AI;
};

export const isAIOfType = (ai: string) => (cmp: BaseComponent): cmp is AI => {
  return isAI(cmp) && cmp.ai === ai;
};
