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

export const matchNeighborScore = (mask: string) => (score: number) => {
  const scoreInBinary = score.toString(2);
  const scoreSignificantBits = scoreInBinary.length;
  const padding = (new Array(8 - scoreSignificantBits)).fill('0');
  const scoreSplit = [...padding, ...score.toString(2).split('')];
  const maskBits = mask.split('');

  let match = true;
  for (let bit = 7; bit >= 0; bit--) {
    const value = scoreSplit[bit];
    const compare = maskBits[bit];
    if (compare === '?') { continue; }
    if (value !== compare) { return false; }
  }
  return match;
}
