import state from './state';
import { WIDTH, HEIGHT, LOG_HEIGHT, STATS_HEIGHT } from './constants';
import { RunState } from './state/fsm';
import {
  Health,
  MeleeCombat,
  Inventory,
  Item,
  Name,
  Position,
} from './state/components';

export const drawGUI = () => {
  drawBorders(); 
  drawLog();
  drawStats();
  drawInventory(state.getState().runState);
}

const drawBorders = () => {
  const fg = '#333';
  const bg = 'black';
  for (let x = 1; x < WIDTH - 1; x++) {
    state.display.draw(x, 0, '─', fg, bg);
    state.display.draw(x, HEIGHT - 1, '═', fg, bg);
    state.display.draw(x, HEIGHT + STATS_HEIGHT - 1, '═', fg, bg);
    state.display.draw(x, HEIGHT + LOG_HEIGHT + STATS_HEIGHT - 1, '─', fg, bg);
  }
  for (let y = 1; y < HEIGHT + STATS_HEIGHT + LOG_HEIGHT - 1; y++) {
    state.display.draw(0, y, '│', fg, bg);
    state.display.draw(WIDTH - 1, y, '│', fg, bg); 
  }
  state.display.draw(0, 0, '┌', fg, bg);
  state.display.draw(0, HEIGHT - 1, '╞', fg, bg);
  state.display.draw(0, HEIGHT + STATS_HEIGHT - 1, '╞', fg, bg);
  state.display.draw(WIDTH - 1, HEIGHT - 1, '╡', fg, bg);
  state.display.draw(WIDTH - 1, HEIGHT + STATS_HEIGHT - 1, '╡', fg, bg);
  state.display.draw(WIDTH - 1, 0, '┐', fg, bg);
  state.display.draw(0, HEIGHT + LOG_HEIGHT + STATS_HEIGHT - 1, '└', fg, bg);
  state.display.draw(WIDTH - 1, HEIGHT + LOG_HEIGHT + STATS_HEIGHT - 1, '┘', fg, bg);
}

const drawLog = () => {
  const log = state.getState().log;
  if (!state.display) { return; }
  const N = LOG_HEIGHT - 1;
  const colorOffset = Math.max(N - log.length, 0);
  const lastLines = (log.length <= N ? [...log] : [...log].slice(log.length - N)).reverse();
  for (let i = 0; i < lastLines.length; i++) {
    const line = lastLines[lastLines.length - i - 1];
    const chars = '4579bdf'.split('');
    const lineColor = `#${ (new Array(3)).fill(chars[i + colorOffset]).join('') }`;
    state.display.drawText(2, HEIGHT + STATS_HEIGHT + i, `%c{${lineColor}}${line}`);
  }
}

const drawStats = () => {
  if (!state.display) { return; }
  const cmp = state.world.getComponentMap(state.getState().player);
  const { health, maxHealth, dead } = cmp.get(Health) as Health || {};
  const { damage } = cmp.get(MeleeCombat) as MeleeCombat || {};
  let text: string;
  if (!health || dead) {
    text = `%c{#333}HP: %c{#666}DEAD`
  } else {
    text = `%c{#333}HP: %c{#666}${health}%c{#333}/%c{#666}${maxHealth}  %c{#333}DMG: %c{#666}${damage}`;
  }
  const inventory = cmp.get(Inventory) as Inventory;
  if (inventory && inventory.contents.length > 0) {
    const weight = getWeight(inventory);
    const capacity = inventory.capacity;
    text += `  %c{#333}Weight: %c{#666}${weight}%c{#333}/%c{#666}${capacity}`;
  }
  state.display.drawText(2, HEIGHT, text);
}

const getWeight = (inventory: Inventory) => {
  return inventory.contents.reduce((sum, e) => {
    const item = state.world.getComponentMap(e).get(Item) as Item;
    if (!item) { return sum; }

    return sum + item.weight;
  }, 0)
}

const drawInventory = (runState) => {
  const states = [
    RunState.GUI_INVENTORY,
    RunState.GUI_INVENTORY_DROP,
    RunState.GUI_INVENTORY_GET,
  ];
  if (!states.includes(runState)) { return; }
  const player = state.getState().player;
  const playerCmp = state.world.getComponentMap(player);
  const inventory = playerCmp.get(Inventory) as Inventory;
  if (!inventory) { return; }
  const weight = getWeight(inventory);
  const fg = '#333';
  const bg = 'black';

  const hPad = 10;
  const vPad = 4;
  for (let x = hPad; x < WIDTH - hPad; x++) {
    for (let y = vPad; y < HEIGHT - vPad; y++) {
      if (x === hPad && y === vPad) {
        state.display.draw(x, y, '┌', fg, bg);
      } else if (x === WIDTH - hPad - 1 && y === vPad) {
        state.display.draw(x, y, '┐', fg, bg);
      } else if (x === hPad && y === HEIGHT - vPad - 1) {
        state.display.draw(x, y, '└', fg, bg);
      } else if (x === WIDTH - hPad - 1 && y === HEIGHT - vPad - 1) {
        state.display.draw(x, y, '┘', fg, bg);
      }  else if (y === vPad + 2) {
        if (x === hPad) {
          state.display.draw(x, y, '├', fg, bg);
        } else if (x === WIDTH - hPad - 1) {
          state.display.draw(x, y, '┤', fg, bg);
        } else {
          state.display.draw(x, y, '─', fg, bg);
        }
      }else if (x === hPad || x === WIDTH - hPad - 1) {
        state.display.draw(x, y, '│', fg, bg);
      } else if (y === vPad || y === HEIGHT - vPad - 1) {
        state.display.draw(x, y, '─', fg, bg)
      } else {
        state.display.draw(x, y, ' ', fg, bg);
      }
    }
  }
  if (runState === RunState.GUI_INVENTORY) {
    state.display.drawText(hPad + 2, vPad + 1, `%c{#333}Inventory: %c{#666}${weight}/${inventory.capacity}`);
  } else if (runState === RunState.GUI_INVENTORY_DROP) {
    state.display.drawText(hPad + 2, vPad + 1, `%c{#333}Drop which item?`);
  } else if (runState === RunState.GUI_INVENTORY_GET) {
    state.display.drawText(hPad + 2, vPad + 1, `%c{#333}Pick up which item?`);

  }

  const offset = vPad + 4;
  const keys = 'ASDFGHJKL'.split('');
  let names: string[] = [];
  if (runState === RunState.GUI_INVENTORY_GET) {
    const pos = playerCmp.get(Position) as Position;
    names = (state.map.entities.get(state.map.getIdx(pos.x, pos.y)) || [])
      .filter(e => {
        const item = state.world.getComponentMap!(e).get(Item) as Item;
        return !!item && !item.owner;
      })
      .map(item => {
        const name = state.world.getComponentMap!(item).get(Name) as Name;
        return name ? name.name : 'something';
      }); 
  } else if (runState === RunState.GUI_INVENTORY_DROP) {
    const inventory = playerCmp.get(Inventory) as Inventory;
    names = inventory.contents.map(e => {
      const cmps = state.world.getComponentMap(e);
      const name = cmps.get(Name) as Name;
      return name ? name.name : 'something';
    })
  } else if (runState === RunState.GUI_INVENTORY) {
    const inventory = playerCmp.get(Inventory) as Inventory;
    names = inventory.contents.map(e => {
      const cmps = state.world.getComponentMap(e);
      const name = cmps.get(Name) as Name;
      return name ? name.name : 'something';
    })

  }
  for (let idx = 0; idx < names.length; idx++) {
    const name = names[idx];
    let prefix = '';
    if ([
      RunState.GUI_INVENTORY_DROP,
      RunState.GUI_INVENTORY_GET
    ].includes(runState)) {
      prefix = `${keys[idx]}) `;
    }
    state.display.drawText(hPad + 2, offset + idx, prefix + name);
  }
  
}
