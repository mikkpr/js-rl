import Vector from 'victor';

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
}

const maxSpeed = 3;

export const separation = (rects: Rect[], desiredSeparation = 25.0): Vector[] => {
  const vectors: Vector[] = (new Array(rects.length).fill(new Vector(0, 0)));

  for (let idx = 0; idx < rects.length; idx++) {
    const rect = rects[idx];
    const rectPos = new Vector(rect.x, rect.y);
    let steeringVector = new Vector(0, 0);
    let count = 0;

    for (let i = 0; i < rects.length; i++) {
      if (i === idx) { continue; }
      const other = rects[i];
      const otherPos = new Vector(other.x, other.y);

      const d = rectPos.distance(otherPos);
      if (d > 0 && d < desiredSeparation) {
        let diff = rectPos.subtract(otherPos);
        diff = diff.normalize();
        diff = diff.divideScalar(d);
        steeringVector = steeringVector.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steeringVector = steeringVector.divideScalar(count);
    }

    if (steeringVector.magnitude() > 0) {
      steeringVector = steeringVector.normalize();
      steeringVector = steeringVector.multiplyScalar(maxSpeed);
    }

    vectors[idx] = steeringVector.toFixed();
  }

  return vectors;
};

export const seek = (rect: Rect, vector: Vector): Vector => {
  const rectPos = new Vector(rect.x, rect.y);
  let desired = vector.subtract(rectPos);  // A vector pointing from the location to the target
  desired = desired.normalize();

  desired = desired.multiplyScalar(maxSpeed);

  return desired.toFixed();
}

export const cohesion = (rects: Rect[], target: Vector, nDist: number = 25): Vector[] => {
  let vectors = (new Array(rects.length)).fill(new Vector(0, 0));
  for (let idx = 0; idx < rects.length; idx++) {
    const rect = rects[idx];
    const rectPos = new Vector(rect.x, rect.y);
    let sum = new Vector(0, 0);   // Start with empty vector to accumulate all locations
    let count = 0;
    for (let i = 0; i < rects.length; i++) {
      if (i === idx) { continue; }
      const other = rects[i];
      const otherPos = new Vector(other.x, other.y);

      const dist = rectPos.distance(otherPos);
      if ((dist > 0) && (dist < nDist)) {
        sum = sum.add(otherPos); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum = sum.divideScalar(count);
      sum = sum.toFixed();
      vectors[idx] = seek(rect, target ? target : sum);  // Steer towards the location
    } else {
      vectors[idx] = new Vector(0, 0);
    }
  }
  return vectors;
};

