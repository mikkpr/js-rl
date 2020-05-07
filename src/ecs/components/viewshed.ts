import { Component } from 'ecsy';

class Viewshed extends Component {
  visibleTiles: number[];
  range: number;
  dirty: boolean;
  exploredTiles: Set<number>;

  constructor() {
    super();
    this.visibleTiles = [];
    this.exploredTiles = new Set();
    this.range = 6;
    this.dirty = true;
  }

  reset() {
    this.visibleTiles = [];
    this.exploredTiles = new Set();
    this.range = 6;
    this.dirty = true;
  }

  copy(src) {
    this.visibleTiles = src.visibleTiles;
    this.exploredTiles = src.exploredTiles;
    this.range = src.range;
    this.dirty = src.dirty;
  }
}

export default Viewshed;
