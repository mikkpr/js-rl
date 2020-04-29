export type PanelID = string;
export type Panels = PanelID[];
export type Panel = {
  id: PanelID;
  x: number;
  y: number;
  w: number;
  h: number;
  bg: string;
}
