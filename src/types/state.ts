import {
  Zones,
  Entities,
  Map,
  Camera,
  Log,
  Condition,
  LightingMap,
  ExplorationMap,
  VisibilityMap,
  Items
} from '.';

export type GameState = {
  entities: Entities;
  map: Map;
  lightingMap: LightingMap;
  visibilityMap: VisibilityMap;
  explorationMap: ExplorationMap;
  zones: Zones;
  camera: Camera;
  log: Log;
  items: Items;
}

export type Action = {
  type: string;
  payload: any;
}

export type ConditionalAction = Action & {
  conditions: Condition[];
}
