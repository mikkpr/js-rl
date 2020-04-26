import { ID } from './utils/id';

const ITEM_TYPES = {
  KEY: 'KEY'
};

const ITEM_PROPERTIES = {
  [ITEM_TYPES.KEY]: {
    name: 'a key',
    char: 'F',
    usable: true,
    unique: true,
    fg: '#aa0'
  },
};

const generateItem = (type) => {
  return {
    id: ID(),
    type,
    ...ITEM_PROPERTIES[type],
  };
};

export const generateItems = () => {
  const key = generateItem(ITEM_TYPES.KEY);

  return [
    key
  ];
}
