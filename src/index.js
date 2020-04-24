import * as ROT from 'rot-js';
import game from './gamestate';
import { getCanvasContainer } from './utils/dom';
import { createMapFromRooms, level0, level0portals } from './map';
import { pulseAberration } from './utils/render';


const [WIDTH, HEIGHT] = [21, 21];

export const display = new ROT.Display({
  width: WIDTH,
  height: HEIGHT,
  forceSquareRatio: true,
});

const setupDisplay = async () => {
  return new Promise((resolve) => {
    const canvasContainer = getCanvasContainer();
    canvasContainer.appendChild(display.getContainer());
    resolve();
  });
};

const initialCells = createMapFromRooms(level0);

game.dispatch({
  type: 'UPDATE_CELLS',
  cells: initialCells,
});

const initialPortals = level0portals;
game.dispatch({
  type: 'UPDATE_PORTALS',
  portals: initialPortals,
});

game.dispatch({ type: 'CALCULATE_FOV' });

const renderMap = display => {
  const { map, lightingMap, explorationMap, mapOffset } = game.getState();

  const cells = Object.values(map);

  cells.forEach(cell => {
    const {
      x,
      y,
      char,
      fg,
      bg,
    } = cell;
    const key = `${x}_${y}`;
    const visibility = key in lightingMap
      ? lightingMap[key]
      : explorationMap.includes(key)
      ? 0.25
      : 0;

    const color = ROT.Color.toHex(ROT.Color.interpolate(
      ROT.Color.fromString(bg),
      ROT.Color.fromString(fg),
      visibility,
    ));
    const [Xoffset, Yoffset] = mapOffset.map(d => -21 * d);
    display.draw(x + Xoffset, y + Yoffset, char, color, bg);
  });
}

const renderPlayer = display => {
  const { player, mapOffset } = game.getState();
  const { x, y } = player;
  const [Xoffset, Yoffset] = mapOffset.map(d => -21 * d);

  display.draw(x + Xoffset, y + Yoffset, '@', '#fff', '#000');
};

const redraw = (pulse = false) => {
  display.clear();

  renderMap(display);

  renderPlayer(display);

  if (pulse) {
    const randomIntensity = Math.max(0, 1 - Math.floor(Math.random() * 5));
    const randomPhase = Math.max(0, 1 - Math.floor(Math.random() * 5));
    pulseAberration(display, randomIntensity, randomPhase, () => redraw(false));
  }
};

const handleKeyup = (e) => {
  const code = e.keyCode;

  let dx = 0;
  let dy = 0;

  if ([ROT.KEYS.VK_A, ROT.KEYS.VK_H, ROT.KEYS.VK_LEFT].includes(code)) {
    dx -= 1;
  }
  if ([ROT.KEYS.VK_S, ROT.KEYS.VK_J, ROT.KEYS.VK_DOWN].includes(code)) {
    dy += 1;
  }
  if ([ROT.KEYS.VK_D, ROT.KEYS.VK_L, ROT.KEYS.VK_RIGHT].includes(code)) {
    dx += 1;
  }
  if ([ROT.KEYS.VK_W, ROT.KEYS.VK_K, ROT.KEYS.VK_UP].includes(code)) {
    dy -= 1;
  }

  if (dx === 0 && dy === 0) { return; }

  game.dispatch({ type: 'MOVE_PLAYER', dx, dy });
};

const setupInput = async () => {
  document.body.addEventListener('keyup', handleKeyup);
};

const setup = async () => {
  game.log('Setting up display...');
  await setupDisplay();
  setupInput();
  game.log('Setting up player...');
  game.log('Done.');
  game.clearLog();

  requestAnimationFrame(redraw);
};

setup();

game.subscribe(() => requestAnimationFrame(redraw));

window.game = game;
window.ROT = ROT;
window.display = display;
