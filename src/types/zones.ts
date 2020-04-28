import { Action, Coordinates, Area, ConditionalAction } from '.';
export type TriggerType = 'ENTER' | 'EXIT' | 'WITHIN';

export type Trigger = {
  type: TriggerType;
  actions: (Action | ConditionalAction)[];
  flags?: string[];
}

export type Zone = {
  cells: Array<Coordinates | Area>;
  triggers: Trigger[];
  glyph?: string;
  id?: string;
}

export type Zones = {
  [id: string]: Zone;
}
