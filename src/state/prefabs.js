// base
export const Tile = {
  name: 'Tile',
  components: [
    { type: 'Appearance' },
    { type: 'Description' },
    { type: 'Layer100' },
  ]
};

export const Being = {
  name: 'Being',
  components: [
    { type: 'Appearance' },
    { type: 'Defense' },
    { type: 'Description' },
    { type: 'Health' },
    { type: 'IsBlocking' },
    { type: 'Layer400' },
    { type: 'Power' },
  ]
};

export const Item = {
  name: 'Item',
  components: [
    { type: 'Appearance' },
    { type: 'Description' },
    { type: 'Layer300' },
    { type: 'IsPickup' },
  ]
};

// complex
export const Wall = {
  name: 'Wall',
  inherit: ['Tile'],
  components: [
    { type: 'IsBlocking' },
    { type: 'IsOpaque' },
    {
      type: 'Appearance',
      properties: { char: '#', color: '#aaa' },
    },
    {
      type: 'Description',
      properties: { name: 'wall' },
    }
  ]
};

export const Floor = {
  name: 'Floor',
  inherit: ['Tile'],
  components: [
    {
      type: 'Appearance',
      properties: { char: '.', color: '#555' },
    },
    {
      type: 'Description',
      properties: { name: 'floor' },
    }
  ]
};

export const Player = {
  name: "Player",
  inherit: ["Being"],
  components: [
    {
      type: "Appearance",
      properties: { char: "@", color: "#FFF" },
    },
    {
      type: "Description",
      properties: { name: "You" },
    },
    {
      type: "Health",
      properties: { current: 20, max: 20 },
    },
    {
      type: "Inventory",
    }
  ],
};

export const Goblin = {
  name: "Goblin",
  inherit: ["Being"],
  components: [
    { type: "Ai" },
    {
      type: "Appearance",
      properties: { char: "g", color: "green" },
    },
    {
      type: "Description",
      properties: { name: "goblin" },
    },
  ],
};

export const HealthPotion = {
  name: 'HealthPotion',
  inherit: ['Item'],
  components: [
    {
      type: 'Appearance',
      properties: { char: '!', color: '#DAA520' },
    }, {
      type: 'Description',
      properties: { name: 'health potion' },
    }, {
      type: 'Effects',
      properties: { component: 'health', delta: 5 },
    }
  ]
}

const Base = [Tile, Being, Item];
const Complex = [Wall, Floor, Goblin, Player, HealthPotion];

export {
  Base,
  Complex,
}
