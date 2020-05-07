import { Component } from 'ecsy';

class Position extends Component {
  x: number;
  y: number;

  constructor() {
    super();
    this.x = 1;
    this.y = 1;
  }

  reset(): void {
    this.x = 1;
    this.y = 0;
  }
}

export default Position;
