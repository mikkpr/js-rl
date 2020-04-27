import { Player, Map, Camera, Log } from '.';
export type GameState = { player: Player } & { map: Map } & { camera: Camera } & { log: Log}

export interface Action {
  type: string;
  payload: any;
}