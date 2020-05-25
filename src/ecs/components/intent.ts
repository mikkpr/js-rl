import { BaseComponent } from 'ecs-machina';

export interface Intent extends BaseComponent {
  intent: string;
  payload: {
    [key: string]: any
  };
}

export const Intent = 'Intent';

export const isIntent = (cmp: BaseComponent): cmp is Intent => {
  return cmp._type === Intent;
};

export const isIntentOfType = (intent: string) => (cmp: BaseComponent): cmp is Intent => {
  return isIntent(cmp) && cmp.intent === intent;
};
