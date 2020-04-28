export type Parameter = 'entity' | 'src' | 'dest';
export type EntityField = 'type' | 'glyph' | 'fg' | 'bg' | 'x' | 'y';
export type CellField = 'type' | 'x' | 'y';
export type Field = EntityField | CellField;
export type StringOperator = 'eq' | 'neq';
export type NumberOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'lte' | 'gte';
export type StringComparison = [ Field, StringOperator, string ];
export type NumberComparison = [ Field, NumberOperator, number ];
export type Comparison = StringComparison | NumberComparison;

export type Condition = [ Parameter, Comparison ];