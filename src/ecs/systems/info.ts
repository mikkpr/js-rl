import { System } from 'ecsy';
import { Name, Position } from '../components';

class InfoSystem extends System {
  execute(): void {}
}

InfoSystem.queries = {
  info: { components: [ Position, Name ]}
};

export default InfoSystem;
