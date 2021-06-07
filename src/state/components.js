import { Entity } from 'geotic';
import remove from 'lodash/remove';
import { Component } from 'geotic';
import { addCacheSet, deleteCacheSet } from './cache';

export class Appearance extends Component {
  static properties = {
    color: '#ff0077',
    char: '?',
    background: '#000',
  };
}

export class Position extends Component {
  static properties = {
    x: 0,
    y: 0,
  };

  onAttached() {
    const locId = `${this.entity.position.x},${this.entity.position.y}`;
    addCacheSet("entitiesAtLocation", locId, this.entity.id);
  }

  onDestroyed() {
    const locId = `${this.x},${this.y}`;
    deleteCacheSet("entitiesAtLocation", locId, this.entity.id);
  }
}

export class Move extends Component {
  static properties = {
    x: 0,
    y: 0,
    relative: true,
  }
};

export class IsBlocking extends Component { }

export class Layer100 extends Component { }

export class Layer300 extends Component { }

export class Layer400 extends Component { }

export class IsInFov extends Component { }

export class IsOpaque extends Component { }

export class IsRevealed extends Component { }

export class Description extends Component {
  static properties = { name: 'No Name' };
}

export class Ai extends Component { }

export class Defense extends Component {
  static properties = { max: 1, current: 1 };
}

export class Health extends Component {
  static properties = { max: 10, current: 10 };

  onTakeDamage(evt) {
    this.current -= evt.data.amount;
    evt.handle();
  }
}

export class Power extends Component {
  static properties = { max: 5, current: 5 };
}

export class IsDead extends Component { }

export class IsPickup extends Component { }

export class Inventory extends Component {
  static properties = {
    list: new Set(),
  };

  onPickUp(evt) {
    this.list.add(evt.data.id);

    if (evt.data.position) {
      evt.data.remove(evt.data.position);
    }
  }

  onDrop(evt) {
    if (this.list.has(evt.data.id)) {
      this.list.delete(evt.data.id);
      evt.data.add(Position, this.entity.position);
    }
  }

  onConsume(evt) {
    if (this.list.has(evt.data.id)) {
      this.list.delete(evt.data.id);
    }
  }
}

export class ActiveEffects extends Component {
  static allowMultiple = true;
  static properties = { component: '', delta: '' };
}

export class Effects extends Component {
  static allowMultiple = true;
  static properties = { component: '', delta: '' };
}
