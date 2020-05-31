import { BaseComponent } from 'ecs-machina';
import { CellType } from '../../map';

export interface Trigger extends BaseComponent {
  triggered: boolean;
  condition: TriggerCondition;
  event: TriggerEvent;
  repeat: 'ONCE' | 'TOGGLE' | 'REPEAT';
  messages?: {
    enter?: string;
    exit?: string;
    trigger?: string;
    revert?: string;
  }
}

export const Trigger = 'Trigger';

export const isTrigger = (cmp: BaseComponent): cmp is Trigger => {
  return cmp._type === Trigger;
}

export interface Enter {
  type: 'ENTER'
}

export interface Weight {
  type: 'WEIGHT',
  amount: number;
}

export type TriggerCondition = Enter | Weight;

export interface ChangeCell {
  type: 'CHANGE_CELL',
  idx: number;
  newType: CellType,
  oldType?: CellType,
}

export interface DealDamage {
  type: 'DEAL_DAMAGE',
  amount: number;
}

export type TriggerEvent = ChangeCell | DealDamage;
