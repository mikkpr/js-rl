import { Component } from 'ecsy';
import has from 'lodash/has';

class Name extends Component {
  name: string;

  constructor() {
    super();
    this.name = '';
  }

  reset(): void {
    this.name = '';
  }

  copy(src): void {
    const fields = [
      'name',
    ];
    fields.forEach(field => {
      if (has(src, field)) {
        this[field] = src[field];
      }
    });
  }
}

export default Name;
