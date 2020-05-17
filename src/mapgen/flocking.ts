import Vector from 'victor';

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
  final?: boolean;
  discarded?: boolean;
}

export interface Movable {
  velocity: Vector;
  acceleration: Vector;
}

export type MovableRect = Rect & Movable;

const maxSpeed = 30;
const maxForce = 0.1;

export const dSquared = (rect, other) => {
  const outer = {
    l: Math.min(rect.x - rect.w / 2, other.x - other.w / 2),
    t: Math.min(rect.y - rect.h / 2, other.y - other.h / 2),
    r: Math.max(rect.x + rect.w / 2, other.x + other.w / 2),
    b: Math.max(rect.y + rect.h / 2, other.y + other.h / 2)
  };
  const innerWidth = Math.max(0, outer.r - outer.l - rect.w - other.w);
  const innerHeight = Math.max(0, outer.b - outer.t - rect.h - other.h);
  // console.log(outer, innerWidth, innerHeight);


  return Math.sqrt(Math.pow(innerWidth, 2) + Math.pow(innerHeight, 2));
};

export const separation = (rects: MovableRect[], desiredSeparation = 25.0, target: Vector): Vector[] => {
  const vectors: Vector[] = (new Array(rects.length).fill(new Vector(0, 0)));

  for (let idx = 0; idx < rects.length; idx++) {
    const rect = rects[idx];
    const rectPos = new Vector(rect.x, rect.y);
    let steeringVector = new Vector(0, 0);
    let count = 0;

    for (let i = 0; i < rects.length; i++) {
      //if (i === idx) { continue; }
      const other = rects[i];
      const otherPos = new Vector(other.x, other.y);

      let diff = rectPos.clone().subtract(otherPos);
      // const d = dSquared(rect, other);
      const d = diff.clone().magnitude();
      if (d > 0 && d < desiredSeparation) {
        const sizeRatio = (rect.w * rect.h) / (other.w * other.h);
        diff = diff.normalize();
        const invSq = 1 / (1 / sizeRatio) * Math.pow(d, 2);
        if (invSq > 0 && invSq < 100) {
          diff.multiplyScalar(invSq)
        }
        steeringVector.add(diff);
        count++;
      } else if (d === 0) {
        diff = diff.normalize();
        const dist = rectPos.clone().distance(otherPos.clone());
        if (dist) {
          diff.multiplyScalar(1 / Math.pow(dist, 2));
          steeringVector.add(diff);
          count++;
        }
      }
    }
    if (count > 0) {
      steeringVector.divideScalar(count);
    }
    if (steeringVector.magnitude() > 0) {
      steeringVector = steeringVector.normalize();
      steeringVector = steeringVector.multiplyScalar(maxSpeed);
      steeringVector = steeringVector.subtract(rect.velocity);
      if (steeringVector.magnitude() > 0.05) {
        steeringVector = steeringVector.normalize().multiplyScalar(0.05);
      }
    }

    vectors[idx] = steeringVector;
  }

  return vectors;
};

export const seek = (rect: MovableRect, target: Vector): Vector => {
  const rectPos = new Vector(rect.x, rect.y);
  let desired = target.clone().subtract(rectPos);  // A vector pointing from the location to the target
  desired = desired.normalize();

  desired = desired.multiplyScalar(maxSpeed);

  let steer = desired.subtract(rect.velocity);
  if (steer.magnitude() > 0.05) {
    steer = steer.normalize().multiplyScalar(0.05);
  }

  return steer;
}

export const cohesion = (rects: MovableRect[], nDist = 50, target: Vector): Vector[] => {
  const vectors = (new Array(rects.length)).fill(new Vector(0, 0));
  for (let idx = 0; idx < rects.length; idx++) {
    const rect = rects[idx];
    const rectPos = new Vector(rect.x, rect.y);
    // vectors[idx] = seek(rect, target.clone());
    // continue;
    let count = 0;
    let sum = new Vector(0, 0);
    for (let i = 0; i < rects.length; i++) {
      if (i === idx) { continue; }
      const other = rects[i];
      const otherPos = new Vector(other.x, other.y);

      const dist = Math.sqrt(dSquared(rect, other));

      if ((dist > 0) && (dist < nDist)) {
        sum.add(otherPos.clone().normalize());
        count++;
      }
    }
    if (count > 0) {
      let steering = seek(rect, target.clone()); 
      vectors[idx] = steering; // Steer towards the location
    }
  }
  return vectors;
};

