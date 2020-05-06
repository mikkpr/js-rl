import { Component } from 'ecsy';

class Position extends Component {
  x: number;
  y: number;

  constructor() {
    super();
    this.x = 0;
    this.y = 0;
  }
}

export default Position;