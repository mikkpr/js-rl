import { Zones, Entities, Map, Camera, Log, Condition } from '.';
export type GameState = {
  entities: Entities;
  map: Map;
  zones: Zones;
  camera: Camera;
  log: Log;
}

export type Action = {
  type: string;
  payload: any;
}

export type ConditionalAction = Action & {
  conditions: Condition[];
}
