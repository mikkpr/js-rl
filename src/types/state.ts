import { Entities, Map, Camera, Log } from '.';
export type GameState = { entities: Entities } & { map: Map } & { camera: Camera } & { log: Log}

export interface Action {
  type: string;
  payload: any;
}
