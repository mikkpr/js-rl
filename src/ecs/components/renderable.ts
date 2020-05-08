import { Component } from 'ecsy';
import has from 'lodash/has';

class Renderable extends Component {
  glyph: string;
  fg: string;
  bg: string;

  constructor() {
    super();
    this.glyph = null;
    this.fg = null;
    this.bg = null;
  }

  reset() {
    this.glyph = null;
    this.fg = null;
    this.bg = null;
  }

  copy(src): void {
    const fields = [
      'glyph',
      'fg',
      'bg',
    ];
    fields.forEach(field => {
      if (has(src, field)) {
        this[field] = src[field];
      }
    });
  }
}

export default Renderable;
