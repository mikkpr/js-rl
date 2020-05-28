export const normalizeScore = (score: number) => {
  let normalizedScore = score;
  const masks = {
    NW: 0b00000001,
    N: 0b00000010,
    NE: 0b00000100,
    W: 0b00001000,
    E: 0b00010000,
    SW: 0b00100000,
    S: 0b01000000,
    SE: 0b10000000,
  };
  if ((normalizedScore & masks.NW) != 0) {
    if ((normalizedScore & masks.N) == 0 || (normalizedScore & masks.W) == 0) {
      normalizedScore &= ~masks.NW;
    }
  }
  if ((normalizedScore & masks.NE) != 0) { 
    if ((normalizedScore & masks.N) == 0 || (normalizedScore & masks.E) == 0) {
      normalizedScore &= ~masks.NE;
    }
  }
  if ((normalizedScore & masks.SW) != 0) {
    if ((normalizedScore & masks.S) == 0 || (normalizedScore & masks.W) == 0) {
      normalizedScore &= ~masks.SW;
    }
  }
  if ((normalizedScore & masks.SE) != 0) {
    if ((normalizedScore & masks.S) == 0 || (normalizedScore & masks.E) == 0) {
      normalizedScore &= ~masks.SE;
    }
  }

  return normalizedScore;
}

export const getWallGlyphForMask = (score: number): string => {
  let normalizedScore = normalizeScore(score);  

  const pillar = '○';
  // const wallN = '▀';
  // const wallW = '▌';
  // const wallE = '▐';
  // const wallS = '▄';
  const wallN = '║';
  const wallE = '═';
  const wallS = '║';
  const wallW = '═';
  const tiles = [
    ' ', wallN, wallW, '╝', '╝', wallE, '╚', '╚',
    '═', '╩', '╩', '╩', '═', wallS, '║', '╗',
    '╣', '╣', '╔', '╠', '╠', '╦', '╬', '╬',
    '╬', '╦', '╗', '╣', '║', '╦', '╬', '╠',
    '╬', '╔', '╔', '╠', '║', '╦', '╬', '╬',
    '╣', '╗', '═', '╩', '╚', '╝', ' ', pillar
  ];
  const scoreLookup: {
    [score: number]: number
  } = {
    0: 47,
    2: 1,
    8: 2,
    10: 3,
    11: 4,
    16: 5,
    18: 6,
    22: 7,
    24: 8,
    26: 9,
    27: 10,
    30: 11,
    31: 12,
    64: 13,
    66: 14,
    72: 15,
    74: 16,
    75: 17,
    80: 18,
    82: 19,
    86: 20,
    88: 21,
    90: 22,
    91: 23,
    94: 24,
    95: 25,
    104: 26,
    106: 27,
    107: 28,
    120: 29,
    122: 30,
    123: 31,
    126: 32,
    127: 33,
    208: 34,
    210: 35,
    214: 36,
    216: 37,
    218: 38,
    219: 39,
    222: 40,
    223: 41,
    248: 42,
    250: 43,
    251: 44,
    254: 45,
    255: 46
  };

  const idx = scoreLookup[normalizedScore];
  if (!idx) { return ' '; }
  return tiles[idx];
};
