import { Coordinates, Area, Entity, Cell } from '.';
export type TriggerType = 'ENTER' | 'EXIT';

interface Item {};

type EnterCallback = (who: Entity, from: Cell, to: Cell) => void;
type ExitCallback = (who: Entity, from: Cell, to: Cell) => void;
type DropItemCallback = (item: Item, who: Entity, cell: Cell) => void;
type GetItemCallback = (item: Item, who: Entity, cell: Cell) => void;

export type TriggerCallback = EnterCallback | ExitCallback | DropItemCallback | GetItemCallback;

export type Trigger = {
  type: TriggerType;
  callback: TriggerCallback;
  triggerCount?: number;
  triggerMessage?: string;
}

export type Zone = {
  cells: Array<Coordinates | Area>;
  triggers: Trigger[];
  id?: string;
}

export type Zones = {
  [id: string]: Zone;
}
