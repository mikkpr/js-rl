import { Component } from 'ecsy';
import has from 'lodash/has';

class Light extends Component {
  range: number;
  color: [number, number, number];
  tiles: {
    [idx: string]: [number, number, number];
  };
  dirty: boolean;

  constructor() {
    super();
    this.range = 6;
    this.color = [150, 150, 120];
    this.tiles = {};
    this.dirty = true;
  }

  reset(): void {
    this.range = 6;
    this.color = [150, 150, 120];
    this.tiles = {};
    this.dirty = true;
  }

  copy(src): void {
    const fields = [
      'range',
      'color',
      'tiles',
      'dirty'
    ];
    fields.forEach(field => {
      if (has(src, field)) {
        this[field] = src[field];
      }
    });
  }
}

export default Light;
