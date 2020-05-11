import { Component } from 'ecsy';
import has from 'lodash/has';

class Viewshed extends Component {
  visibleTiles: Set<number>;
  range: number;
  dirty: boolean;
  exploredTiles: Set<number>;

  constructor() {
    super();
    this.visibleTiles = new Set();
    this.exploredTiles = new Set();
    this.range = 6;
    this.dirty = true;
  }

  reset(): void {
    this.visibleTiles = new Set();
    this.exploredTiles = new Set();
    this.range = 6;
    this.dirty = true;
  }

  copy(src: Viewshed): void {
    const fields = [
      'visibleTiles',
      'exploredTiles',
      'range',
      'dirty'
    ];
    fields.forEach(field => {
      if (has(src, field)) {
        this[field] = src[field];
      }
    });
  }
}

export default Viewshed;
