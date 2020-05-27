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
  isBody
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
  const nextPosSolid = state.map.isSolid(nextPosX, nextPosY);
  const nextPosOccupant = state.map.entities.get(state.map.getIdx(nextPosX, nextPosY));
  const blocker = nextPosOccupant
    ? state.world
      .getComponents(nextPosOccupant)
      .filter(isBody)
      .filter(c => c.solid).length > 0
    : undefined; 
  const nextPosOutOfBounds = (
    nextPosX < 0 ||
    nextPosY < 0 ||
    nextPosX >= state.map.width ||
    nextPosY >= state.map.height
  );
  const nextPosFree = (!nextPosSolid && !blocker && !nextPosOutOfBounds);

  if (nextPosFree) {
    position.x = nextPosX;
    position.y = nextPosY;

    state.map.setEntityLocation(entity, state.map.getIdx(position.x, position.y));

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
