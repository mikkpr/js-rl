import { Zones, Entities, Map, Camera, Log } from '.';
export type GameState = {
  entities: Entities;
  map: Map;
  zones: Zones;
  camera: Camera;
  log: Log;
}

export interface Action {
  type: string;
  payload: any;
}
