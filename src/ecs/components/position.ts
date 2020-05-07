import { Component } from 'ecsy';

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
    this.x = src.x;
    this.y = src.y;
  }
}

export default Position;
