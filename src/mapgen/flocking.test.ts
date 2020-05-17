import { dSquared } from './flocking';

describe('dSquared', () => {
  const rect1 = {
    x: 0,
    y: 0,
    w: 10,
    h: 10
  };
  const rect2 = {
    x: 15,
    y: 15,
    w: 2,
    h: 2
  };
  it('returns a valid value', () => {
    expect(dSquared(rect1, rect2)).toBe(14.142135623730951);
  })
  it('returns 0 for overlapping rects', () => {
    expect(dSquared(rect1, rect1)).toBe(0);
  })
});
