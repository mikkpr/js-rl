import { Component } from 'ecsy';

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

  copy(src) {
    this.glyph = src.glyph;
    this.fg = src.fg;
    this.bg = src.bg;
  }
}

export default Renderable;
