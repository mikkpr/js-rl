import { Entity, Cell, Condition } from '../types';

const operations: {
  [operator: string]: (a: string | number, b: string | number) => boolean;
} = {
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
  lt: (a, b) => a < b,
  gt: (a, b) => a > b,
  lte: (a, b) => a <= b,
  gte: (a, b) => a >= b
};

export const isConditionTrue = (entity: Entity, src: Cell, dest: Cell) => (condition: Condition): boolean => {
  const inputs = { entity, src, dest };
  const [ parameter, comparison ] = condition;
  const [ field, operator, value ] = comparison;

  const [a, b] = [inputs[parameter][field], value];
  const operation = operations[operator];

  return !!(operation && operation(a, b));
};