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
}

export default Renderable;