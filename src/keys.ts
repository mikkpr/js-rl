import Eylem from 'eylem';

// https://keycode.info/
export const inputs = new Eylem(document, [
  'MOVE'
]);

inputs.bindInputMap(Eylem.KEY_DOWN, {
  72: { action: 'MOVE', value: 'W' },
  74: { action: 'MOVE', value: 'S' },
  75: { action: 'MOVE', value: 'N' },
  76: { action: 'MOVE', value: 'E' },
  89: { action: 'MOVE', value: 'NW' },
  85: { action: 'MOVE', value: 'NE' },
  66: { action: 'MOVE', value: 'SW' },
  78: { action: 'MOVE', value: 'SE' }
});
