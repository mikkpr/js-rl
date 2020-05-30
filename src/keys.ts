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
  'ESC',
  'DROP'
]);

inputs.bindInputMap(Eylem.KEY_DOWN, {
  72: { action: 'MOVE', value: 'W' },
  74: { action: 'MOVE', value: 'S' },
  75: { action: 'MOVE', value: 'N' },
  76: { action: 'MOVE', value: 'E' },
  89: { action: 'MOVE', value: 'NW' },
  85: { action: 'MOVE', value: 'NE' },
  66: { action: 'MOVE', value: 'SW' },
  78: { action: 'MOVE', value: 'SE' },
  32: { action: 'DWIM', value: 'DWIM' },
  71: { action: 'GET', value: 'GET' },
  73: { action: 'GUI', value: 'INVENTORY' },
  27: { action: 'ESC', value: 'ESC' },
  68: { action: 'DROP', value: 'DROP' },
});

const dropKeys = new Eylem(document, [
  'ASDFGHJKL'.split('')
]);

dropKeys.bindInputMap(Eylem.KEY_DOWN, {
  65: { action: 'DROP', value: 'A' },
  83: { action: 'DROP', value: 'S' },
  68: { action: 'DROP', value: 'D' },
  70: { action: 'DROP', value: 'F' },
  71: { action: 'DROP', value: 'G' },
  72: { action: 'DROP', value: 'H' },
  74: { action: 'DROP', value: 'J' },
  75: { action: 'DROP', value: 'K' },
  76: { action: 'DROP', value: 'L' },
});

export const input = (player: string) => () => {
  const esc = inputs.getValue('ESC');
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
    const drop = inputs.getValue('DROP');
    if (drop) {
      state.setState(state => { state.runState = RunState.GUI_INVENTORY_DROP; })
    }
  } else if (runState === RunState.GUI_INVENTORY_DROP) {
    const key = dropKeys.getValue('DROP');
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
  } if (runState === RunState.WAITING_INPUT) {
    if (cmp.get(Health) as Health == null) {
      inputs.clear();
      return;
    }
    if (esc) {
      state.setState(state => {
        state.runState = RunState.WAITING_INPUT;
      });
    } else if (gui) {
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
        if (cell === CellType.DOOR_CLOSED) {
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
      const pos = state.world.getComponentMap(player).get(Position) as Position;
      const entities = state.map.entities.get(state.map.getIdx(pos.x, pos.y)).filter(e => {
        const item = state.world.getComponentMap(e).get(Item) as Item;
        return !!item && !item.owner;
      });
      if (entities.length > 0) {
        const topEntity = entities[0];
        state.world.registerComponent(player, {
          _type: Intent,
          intent: 'PICK_UP',
          payload: {
            target: topEntity
          }
        } as Intent);
        state.setState(state => { state.runState = RunState.PLAYER_TURN; });
      }
    }
  }
  inputs.clear();
};

