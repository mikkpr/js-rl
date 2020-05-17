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
  // r1 = 5
  // l2 = 13
  // b1 = 5
  // t2 = 13
  // bounding = (-5,-5),(17,17)
  // iw = 22 - 12 = 10
  // ih = 22 - 12 = 10
  // d = sqrt(10*10 + 10*10) = sqrt(200)
  expect(dSquared(rect1, rect2)).toEqual(14);
});
