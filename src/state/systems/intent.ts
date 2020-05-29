import { BaseComponent, System } from 'ecs-machina';
import { WIDTH, HEIGHT } from '../../constants';
import state from '..';
import { CellType } from '../../map';
import { rollDice } from '../../utils/rng';

import {
  Intent,
  isIntent,
  isIntentOfType, 
  Position,
  isPosition,
  Viewshed,
  isViewshed,
  isBody,
  isMeleeCombat,
  isHealth,
  isAI,
  isName,
} from '../components';

export class IntentSystem extends System { 
  public requiredComponents = [Intent, Position];

  public updateEntity(entity: string, components: BaseComponent[]): void {
    const intent = components.find(isIntent);
    const health = components.find(isHealth);
 
    if (!health || !health.dead) {
      if (isIntentOfType('MOVE')(intent)) {
        handleMove(entity, components);
      } else if (isIntentOfType('OPEN_DOOR')(intent)) {
        handleOpenDoor(entity, components);
      } else if (isIntentOfType('CLOSE_DOOR')(intent)) {
        handleCloseDoor(entity, components);
      } else if (isIntentOfType('ATTACK')(intent)) {
        handleAttack(entity, components);
      }
    } 

    this.world.removeComponentByType(entity, Intent);
  }
}

export const handleMove = (entity: string, components: BaseComponent[]): void => {
  const movementIntent = components.find(isIntentOfType('MOVE'));
  const position = components.find(isPosition);
  const viewshed = components.find(isViewshed);
  const meleeCombat = components.find(isMeleeCombat);
  const nextPosX = position.x + movementIntent.payload.dx;
  const nextPosY = position.y + movementIntent.payload.dy;
  const nextPosSolid = state.map.isSolid(nextPosX, nextPosY);
  const nextPosOccupant = state.map.entities.get(state.map.getIdx(nextPosX, nextPosY));
  const blocker = nextPosOccupant
    ? state.world
      .getComponents(nextPosOccupant)
      .filter(isBody)
      .filter(c => c.solid).length > 0 && nextPosOccupant
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
  } else if (blocker && meleeCombat) {
    movementIntent.intent = 'ATTACK';
    movementIntent.payload = { target: blocker }
    handleAttack(entity, components);
  }
}

export const handleOpenDoor = (entity: string, components: BaseComponent[]): void => {
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
    state.log('You open the door.');
  } 
}

export const handleCloseDoor = (entity: string, components: BaseComponent[]): void => {
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
    state.log('You close the door.');
  }
}

export const handleAttack = (entity: string, components: BaseComponent[]): void => {
  const position = components.find(isPosition);
  const attackIntent = components.find(isIntentOfType('ATTACK'));
  const meleeCombat = components.find(isMeleeCombat);
  if (!meleeCombat) { return; }

  const { payload } = attackIntent as Intent;
  const { target } = payload;

  const targetPosition = state.world.getComponents(target).find(isPosition);
  const dx = targetPosition.x - position.x;
  const dy = targetPosition.y - position.y;
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) { return; }

  if (target) {
    handleReceiveDamage(target, entity);
  }
}

export const handleReceiveDamage = (victim: string, attacker: string): void => {
  const player = state.getState().player;
  const health = state.world.getComponents(victim).find(isHealth);
  const source = state.world.getComponents(attacker).find(isMeleeCombat);
  const name = state.world.getComponents(attacker).find(isName);
  if (!health || !source || health.dead) { return; }
  const victimNameCmp = state.world.getComponents(victim).find(isName);
  const victimName = victim === player ? 'you' : victimNameCmp ? `the ${victimNameCmp.name}` :'someone' ;
  const verb = source.verb.split('|')[attacker === player ? 0 : 1];
  const aggressor = attacker === player ? 'You' : name ? `The ${name.name}` : 'Someone';
  const damage = typeof source.damage === 'string' ? rollDice(source.damage) : source.damage;
  health.health -= damage;
  health.lastAttacker = attacker;
  state.log(`${aggressor} ${verb} ${victimName} for ${damage} damage.`)
  if (health.health <= 0) {
    handleDeath(victim);
  }
}

export const handleDeath = (victim) => {
  const player = state.getState().player;
  const health = state.world.getComponents(victim).find(isHealth);
  health.dead = true;
  const ai = state.world.getComponents(victim).find(isAI);
  if (ai) { state.world.removeComponent(victim, ai) }
  const body = state.world.getComponents(victim).find(isBody);
  if (body) { state.world.removeComponent(victim, body); }
  if (victim === player) {
    state.log(`You are dead!`);
  } else {
    const name = state.world.getComponents(victim).find(isName);
    const nameStr = name ? `The ${name.name}` : 'It';
    state.log(`${nameStr} is dead!`);
  }
}
