import Eylem from 'eylem';
import { match } from 'egna';
import state from './state';
import {
  Health,
  Intent,
  Position,
  Item,
  Inventory,
} from './state/components';
import { RunState } from './state/fsm';
import { DIRS } from './constants';
import { CellType } from './map';

// https://keycode.info/
export const inputs = new Eylem(document, [
  'MOVE',
  'DWIM',
  'GET',
  'GUI',
  'ESC'
]);

export const invInputs = new Eylem(document, [
  'DROP',
  'ESC'
]);

inputs.bindInputMap(Eylem.KEY_DOWN, {
  72: { action: 'MOVE', value: 'W' },
  65: { action: 'MOVE', value: 'W' },
  37: { action: 'MOVE', value: 'W' },
  74: { action: 'MOVE', value: 'S' },
  83: { action: 'MOVE', value: 'S' },
  40: { action: 'MOVE', value: 'S' },
  75: { action: 'MOVE', value: 'N' },
  87: { action: 'MOVE', value: 'N' },
  38: { action: 'MOVE', value: 'N' },
  76: { action: 'MOVE', value: 'E' },
  68: { action: 'MOVE', value: 'E' },
  39: { action: 'MOVE', value: 'E' },
  89: { action: 'MOVE', value: 'NW' },
  85: { action: 'MOVE', value: 'NE' },
  66: { action: 'MOVE', value: 'SW' },
  78: { action: 'MOVE', value: 'SE' },
  32: { action: 'DWIM', value: 'DWIM' },
  71: { action: 'GET', value: 'GET' },
  73: { action: 'GUI', value: 'INVENTORY' },
  27: { action: 'ESC', value: 'ESC' },
});

const itemKeys = new Eylem(document, [
  'ASDFGHJKL'.split('')
]);

invInputs.bindInputMap(Eylem.KEY_DOWN, {
  68: { action: 'DROP', value: 'DROP' }, 
  27: { action: 'ESC', value: 'ESC' },
})

itemKeys.bindInputMap(Eylem.KEY_DOWN, {
  65: { action: 'ITEM', value: 'A' },
  83: { action: 'ITEM', value: 'S' },
  68: { action: 'ITEM', value: 'D' },
  70: { action: 'ITEM', value: 'F' },
  71: { action: 'ITEM', value: 'G' },
  72: { action: 'ITEM', value: 'H' },
  74: { action: 'ITEM', value: 'J' },
  75: { action: 'ITEM', value: 'K' },
  76: { action: 'ITEM', value: 'L' },
});

export const input = (player: string) => () => {
  const esc = inputs.getValue('ESC') || invInputs.getValue('ESC');
  if (esc) { 
    state.setState(state => { state.runState = RunState.WAITING_INPUT; });
  }
  const runState = state.getState().runState;
  const cmp = state.world.getComponentMap(player);
    const move = inputs.getValue('MOVE');
    const dwim = inputs.getValue('DWIM');
    const get = inputs.getValue('GET');
    const gui = inputs.getValue('GUI');
  if (runState === RunState.GUI_INVENTORY) {
    const drop = invInputs.getValue('DROP');
    if (drop) {
      state.setState(state => { state.runState = RunState.GUI_INVENTORY_DROP; })
    }
  } else if (runState === RunState.GUI_INVENTORY_DROP) {
    const key = itemKeys.getValue('ITEM');
    if (key) {
      const player = state.getState().player;
      const playerCmp = state.world.getComponentMap(player);
      const inventory = playerCmp.get(Inventory) as Inventory;
      if (inventory) {
        const keys = 'ASDFGHJKL'.split('');
        const items = inventory.contents.reduce((acc, e, idx) => {
          return {
            ...acc,
            [keys[idx]]: e
          };
        }, {});
        const item = items[key];
        if (item) {
          state.world.registerComponent(player, {
            _type: Intent,
            intent: 'DROP_ITEM',
            payload: {
              item
            }
          } as Intent)
          state.setState(state => { state.runState = RunState.PLAYER_TURN; });
        }
      }
    }
  } else if (runState === RunState.GUI_INVENTORY_GET) {
    const player = state.getState().player;
    const playerCmp = state.world.getComponentMap(player);
    const pos = state.world.getComponentMap(player).get(Position) as Position;
    const entities = state.map.entities.get(state.map.getIdx(pos.x, pos.y)).filter(e => {
      const item = state.world.getComponentMap(e).get(Item) as Item;
      return !!item && !item.owner;
    });
    if (!entities || entities.length === 0) {
      state.setState(state => {
        state.runState = RunState.WAITING_INPUT;
      });
    }

    const key = itemKeys.getValue('ITEM');
    if (key) {
      if (entities.length > 0) {
        const keys = 'ASDFGHJKL'.split('');
        const items = entities.reduce((acc, e, idx) => {
          return {
            ...acc,
            [keys[idx]]: e
          };
        }, {});
        const item = items[key];
        if (item) {
          state.world.registerComponent(player, {
            _type: Intent,
            intent: 'PICK_UP',
            payload: {
              target: item
            }
          } as Intent);
          state.setState(state => { state.runState = RunState.PLAYER_TURN; });
        }
      }
    }
  } else if (runState === RunState.WAITING_INPUT) {
    if (cmp.get(Health) as Health == null) {
      inputs.clear();
      return;
    }
    if (gui) {
      const newState = match(
        'INVENTORY', RunState.GUI_INVENTORY
      )(gui);
      if (newState) {
        state.setState(state => {
          state.runState = newState;
        });
      }
    } else if (move) {
      const { dx, dy } = match(
        'N', () => DIRS.N,
          'E', () => DIRS.E,
          'S', () => DIRS.S,
          'W', () => DIRS.W,
          'NW', () => DIRS.NW,
          'NE', () => DIRS.NE,
          'SW', () => DIRS.SW,
          'SE', () => DIRS.SE,
          DIRS.NONE 
      )(move);

      state.world.registerComponent(player, {
        _type: Intent,
        intent: 'MOVE',
        payload: {
          dx, dy
        }
      } as Intent)
      state.setState(state => { state.runState = RunState.PLAYER_TURN; });
    } else if (dwim) {
      const pos = state.world.getComponentMap(player).get(Position) as Position;
      const neighbors = state.map.getNeighbors(pos.x, pos.y);
      let intent: string;
      let dir; 
      for (const key of Object.keys(neighbors)) {
        const cell = neighbors[key];
        if ([
          CellType.DOOR_LOCKED,
          CellType.DOOR_CLOSED
        ].includes(cell)) {
          intent = 'OPEN_DOOR';
          dir = key;
          break;  
        } else if (cell === CellType.DOOR_OPEN) {
          intent = 'CLOSE_DOOR';
          dir = key;
          break;
        }
      }
      if (intent) {
        state.world.registerComponent(player, {
          _type: Intent,
          intent: intent,
          payload: DIRS[dir] 
        } as Intent)
        state.setState(state => { state.runState = RunState.PLAYER_TURN; });
      }
    } else if (get) {
      const player = state.getState().player;
      const playerCmp = state.world.getComponentMap(player);
      const pos = state.world.getComponentMap(player).get(Position) as Position;
      const entities = state.map.entities.get(state.map.getIdx(pos.x, pos.y)).filter(e => {
        const item = state.world.getComponentMap(e).get(Item) as Item;
        return !!item && !item.owner;
      });
      if (entities && entities.length > 0) {
        state.setState(state => { state.runState = RunState.GUI_INVENTORY_GET; })
      }
    }
  }
  inputs.clear();
  itemKeys.clear();
  invInputs.clear();
};

