import * as ROT from 'rot-js';
import { Entity, System } from 'ecsy';
import { Position, Renderable, Viewshed, Light } from '../components';
import { display } from '../..';
import { drawMap, addLight } from '../../display';
import { CellType, xyIdx } from '../../map';
import { game, player, minimap, MAPWIDTH, MAPHEIGHT } from '../..';

const byZIndex = (a: Entity, b: Entity): number => b.getComponent(Renderable).z - a.getComponent(Renderable).z;

class RenderingSystem extends System {
  display: ROT.Display;

  execute(delta: number, time: number): void {
    const { map, hoveredTileIdx } = game.getState();
    drawMap(map);

    drawMinimap();

    const viewshed = game.player.getComponent(Viewshed);

    this.queries.renderables.results.sort(byZIndex).forEach(entity => {
      const position = entity.getComponent(Position);
      const renderable = entity.getComponent(Renderable);
      const idx = xyIdx(position.x, position.y);
      if (viewshed.visibleTiles && viewshed.visibleTiles.has(idx)) {
        const lights = this.queries.lights.results.map(r => r.getComponent(Light));
        const fgRGB = ROT.Color.fromString(renderable.fg) as Color;
        const fgWithLights = addLight(lights, idx, fgRGB);
        const fg = ROT.Color.toHex(fgWithLights);
        const bg = renderable.bg || '#000';
        const entityHovered = idx === hoveredTileIdx;
        display.draw(
          position.x + game.cameraOffset[0],
          position.y + game.cameraOffset[1],
          renderable.glyph,
          entityHovered ? bg : fg,
          entityHovered ? fg : bg
        );
      }
    });
  }
}

RenderingSystem.queries = {
  renderables: { components: [ Position, Renderable ]},
  lights: { components: [Light] }
};

export default RenderingSystem;

const tileColors = {
  [CellType.FLOOR]: 'rgba(200,200,200,1)',
  [CellType.WALL]: 'rgba(100,100,100,1)',
  [CellType.GRASS]: 'rgba(100,200,100,1)',
  [CellType.DOOR_OPEN]: 'rgba(150, 150, 100, 1)',
  [CellType.DOOR_CLOSED]: 'rgba(150, 150, 100, 1)',
  [CellType.DOOR_LOCKED]: 'rgba(150, 150, 100, 1)',
  [CellType.GRASSY_WALL]: 'rgba(80, 150, 80)',
}

const drawMinimap = () => {
  const { map, minimapVisible } = game.getState();
  if (!minimapVisible) { return minimap.setAttribute('style', 'display: none;') }

  const playerViewshed = player.getComponent(Viewshed);
  const { x: X, y: Y } = player.getComponent(Position);
  const { exploredTiles } = playerViewshed;
  const ctx = (minimap as HTMLCanvasElement).getContext('2d');
  ctx.clearRect(0, 0, MAPWIDTH * 2, MAPHEIGHT * 2);
  const tiles = !window.DEBUG ? playerViewshed.exploredTiles : new Set(Object.keys(map));
  for (const idx of (tiles as Set<number>).values()) {
    if ([CellType.WALL, CellType.GRASSY_WALL].includes(map[idx])) { continue; }
    const x = idx % MAPWIDTH;
    const y = ~~(idx / MAPWIDTH);
    ctx.fillStyle = tileColors[map[idx]];
    ctx.fillRect( x * 2, y * 2, 2, 2 );
  }
  ctx.fillStyle = "rgba(255, 0, 0, 1)";
  ctx.fillRect( X * 2, Y * 2, 2, 2 );
  minimap.setAttribute('style', `display: block;position: absolute; margin-left: -${X * 2}px; margin-top: -${Y * 2 + 256}px;opacity:0.5;`);
}
