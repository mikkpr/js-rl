import { matchNeighborScore } from './map';

describe('matchNeighborScore', () => {
  it ('returns true if the given score matches the mask', () => {
    const score = 0b01010101;
    const mask = '???1010?';
    expect(matchNeighborScore(mask)(score)).toBe(true);
  });
  it ('returns false if the score doesn\'t match the mask', () => {
    const score = 0b11111111;
    const mask = '????00??';
    expect(matchNeighborScore(mask)(score)).toBe(false);
  })
})
