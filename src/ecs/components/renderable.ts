import { Component } from 'ecsy';
import has from 'lodash/has';

class Renderable extends Component {
  glyph: string;
  fg: string;
  bg: string;
  z: number;

  constructor() {
    super();
    this.glyph = null;
    this.fg = null;
    this.bg = null;
    this.z = 0;
  }

  reset() {
    this.glyph = null;
    this.fg = null;
    this.bg = null;
    this.z = 0;
  }

  copy(src): void {
    const fields = [
      'glyph',
      'fg',
      'bg',
      'z'
    ];
    fields.forEach(field => {
      if (has(src, field)) {
        this[field] = src[field];
      }
    });
  }
}

export default Renderable;
