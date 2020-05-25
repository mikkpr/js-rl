import Eylem from 'eylem';

// https://keycode.info/
export const inputs = new Eylem(document, [
  'MOVE'
]);

inputs.bindInputMap(Eylem.KEY_DOWN, {
  72: { action: 'MOVE', value: 'W' },
  74: { action: 'MOVE', value: 'S' },
  75: { action: 'MOVE', value: 'N' },
  76: { action: 'MOVE', value: 'E' }
});
