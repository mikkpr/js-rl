import { BaseComponent, System } from 'ecs-machina';
import { WIDTH, HEIGHT } from '../../constants';
import state from '..';
import { CellType } from '../../map';

import {
  Intent,
  isIntent,
  isIntentOfType, 
  Position,
  isPosition,
  Viewshed,
  isViewshed,
} from '../components';

export class IntentSystem extends System { 
  public requiredComponents = [Intent, Position];

  public updateEntity(entity: string, components: BaseComponent[]): void {
    const intent = components.find(isIntent);

    if (isIntentOfType('MOVE')(intent)) {
      handleMove(entity, components);
    } else if (isIntentOfType('OPEN_DOOR')(intent)) {
      handleOpenDoor(entity, components);
    } else if (isIntentOfType('CLOSE_DOOR')(intent)) {
      handleCloseDoor(entity, components);
    } 

    this.world.removeComponentByType(entity, Intent);
  }
}

const handleMove = (entity: string, components: BaseComponent[]): void => {
  const movementIntent = components.find(isIntentOfType('MOVE'));
  const position = components.find(isPosition);
  const viewshed = components.find(isViewshed);
  const nextPosX = position.x + movementIntent.payload.dx;
  const nextPosY = position.y + movementIntent.payload.dy;

  if (!state.map.isSolid(nextPosX, nextPosY)) {
    position.x = Math.min(Math.max(1, nextPosX), WIDTH - 2);
    position.y = Math.min(Math.max(1, nextPosY), HEIGHT - 2);

    if (viewshed) {
      viewshed.dirty = true;
    }
  }
}

const handleOpenDoor = (entity: string, components: BaseComponent[]): void => {
  const doorIntent = components.find(isIntentOfType('OPEN_DOOR'));
  const position = components.find(isPosition);

  const { payload } = doorIntent as Intent;

  const targetX = position.x + payload.dx;
  const targetY = position.y + payload.dy;
  const target = state.map.getCell(targetX, targetY);

  if (target === CellType.DOOR_CLOSED) {
    state.map.setCell(targetX, targetY, CellType.DOOR_OPEN);
    const entities = state.world.findEntitiesByComponents([Viewshed]);
    for (const [entity, cmp] of entities) {
      const viewshed = cmp.find(isViewshed);
      if (viewshed) viewshed.dirty = true;
    }
  } 
}

const handleCloseDoor = (entity: string, components: BaseComponent[]): void => {
  const doorIntent = components.find(isIntentOfType('CLOSE_DOOR'));
  const position = components.find(isPosition);

  const { payload } = doorIntent as Intent;

  const targetX = position.x + payload.dx;
  const targetY = position.y + payload.dy;
  const target = state.map.getCell(targetX, targetY);

  if (target === CellType.DOOR_OPEN) {
    state.map.setCell(targetX, targetY, CellType.DOOR_CLOSED);
    const entities = state.world.findEntitiesByComponents([Viewshed]);
    for (const [entity, cmp] of entities) {
      const viewshed = cmp.find(isViewshed);
      if (viewshed) viewshed.dirty = true;
    }
  }
}
