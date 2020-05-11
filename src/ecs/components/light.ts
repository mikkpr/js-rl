import { Component } from 'ecsy';
import has from 'lodash/has';

class Light extends Component {
  range: number;
  color: Color;
  tiles: {
    [idx: string]: Color;
  };
  dirty: boolean;
  applicable: boolean;

  constructor() {
    super();
    this.range = 6;
    this.color = [150, 150, 120];
    this.tiles = {};
    this.dirty = true;
    this.applicable = false;
  }

  reset(): void {
    this.range = 6;
    this.color = [150, 150, 120];
    this.tiles = {};
    this.dirty = true;
    this.applicable = false;
  }

  copy(src): void {
    const fields = [
      'range',
      'color',
      'tiles',
      'dirty',
      'applicable'
    ];
    fields.forEach(field => {
      if (has(src, field)) {
        this[field] = src[field];
      }
    });
  }
}

export default Light;
