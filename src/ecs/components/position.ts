import { Component } from 'ecsy';
import has from 'lodash/has';

class Position extends Component {
  x: number;
  y: number;
  name: string;

  constructor() {
    super();
    this.x = 1;
    this.y = 1;
  }

  reset(): void {
    this.x = 1;
    this.y = 0;
  }

  copy(src): void {
    const fields = [
      'x',
      'y',
    ];
    fields.forEach(field => {
      if (has(src, field)) {
        this[field] = src[field];
      }
    });
  }
}

export default Position;
