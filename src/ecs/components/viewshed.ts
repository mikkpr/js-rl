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
    this.range = 6;
    this.dirty = true;
  }
}

export default Viewshed;
