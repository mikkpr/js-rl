import { BaseComponent, System } from 'ecs-machina';
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
  isMeleeCombat,
  isHealth,
  Glyph,
  Name,
  Item,
  AI,
  Inventory,
  Body,
  Health,
  MeleeCombat,
  isInventory,
  isKey,
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
      } else if (isIntentOfType('PICK_UP')(intent)) {
        handlePickup(entity, components);
      } else if (isIntentOfType('DROP_ITEM')(intent)) {
        handleDrop(entity, components);
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
  const inventory = components.find(isInventory);
  const nextPosX = position.x + movementIntent.payload.dx;
  const nextPosY = position.y + movementIntent.payload.dy;
  const nextPosSolid = state.map.isSolid(nextPosX, nextPosY);
  const nextPosOccupants = (state.map.entities.get(state.map.getIdx(nextPosX, nextPosY)) || []).filter(e => {
    const body = state.world.getComponentMap(e).get(Body) as Body;
    return body && body.solid;
  });
  const blocker = nextPosOccupants && nextPosOccupants.length > 0
    ? nextPosOccupants[0]
    : undefined; 
  const nextPosOutOfBounds = (
    nextPosX < 0 ||
    nextPosY < 0 ||
    nextPosX >= state.map.width ||
    nextPosY >= state.map.height
  );
  const nextPosFree = (!nextPosSolid && !blocker && !nextPosOutOfBounds);
  const nextCell = (state.map.getCell(nextPosX, nextPosY));
  const nextPosIsDoor = [
    CellType.DOOR_CLOSED,
    CellType.DOOR_LOCKED
  ].includes(nextCell);

  if (nextPosFree) {
    position.x = nextPosX;
    position.y = nextPosY;
    const idx = state.map.getIdx(position.x, position.y);
    state.map.setEntityLocation(entity, idx);
    if (inventory) {
      inventory.contents.forEach(e => {
        const pos = state.world.getComponentMap(e).get(Position) as Position;
        pos.x = nextPosX;
        pos.y = nextPosY;
        state.map.setEntityLocation(e, idx);
      });
    }

    if (viewshed) {
      viewshed.dirty = true;
    }

    const others = (state.map.entities.get(idx) || []).filter(e => e !== entity);
    if (others.length > 0) {
      const str = others.reduce((str, other, idx) => {
        const cmp = state.world.getComponentMap(other);
        const item = cmp.get(Item) as Item;
        if (item && item.owner) { return str; }
        const nameCmp = cmp.get(Name) as Name;
        if (!nameCmp) { return str; }
        const article = nameCmp.article ? nameCmp.article : 'a';

        if (idx === 0) { return `${article} ${nameCmp.name}`; }
        if (idx === others.length - 1) {
          return `${str} and ${article} ${nameCmp.name}`;
        }
    
        return `${str}, ${article} ${nameCmp.name}`;
      }, '');
      if (str.length > 0) {
        state.log(`There is ${str} here.`)
      }
    }
  } else if (blocker && meleeCombat) {
    movementIntent.intent = 'ATTACK';
    movementIntent.payload = { target: blocker }
    handleAttack(entity, components);
  } else if (nextPosIsDoor) {
    movementIntent.intent = 'OPEN_DOOR';
    handleOpenDoor(entity, components);
  }
}

export const handleOpenDoor = (entity: string, components: BaseComponent[]): void => {
  const player = state.getState().player;
  const playerViewshed = state.world.getComponentMap(player).get(Viewshed) as Viewshed;
  const doorIntent = components.find(isIntentOfType('OPEN_DOOR'));
  const entityCmp = state.world.getComponentMap(entity);
  const position = entityCmp.get(Position) as Position;

  const { payload } = doorIntent as Intent;

  const targetX = position.x + payload.dx;
  const targetY = position.y + payload.dy;
  const target = state.map.getCell(targetX, targetY);
  
  const targetIdx = state.map.getIdx(targetX, targetY);
  const openerIdx = state.map.getIdx(position.x, position.y);
  if (target === CellType.DOOR_CLOSED) {
    openDoor(targetX, targetY);
    let name, verb;
    if (entity === player) {
      name = 'You';
      verb = 'open';
    } else if (
      playerViewshed.exploredCells.has(targetIdx) &&
      playerViewshed.exploredCells.has(openerIdx)
    ) {
      const nameCmp = entityCmp.get(Name) as Name;
      name = nameCmp ? `The ${nameCmp.name}` : 'Someone';
      verb = 'opens';
    }
    let str = `${name} ${verb} the door`;
    state.log(str);
  }  else if (target === CellType.DOOR_LOCKED) {
    const inventory = entityCmp.get(Inventory) as Inventory;
    if (inventory && inventory.contents
        .map(e => state.world.getComponents(e))
        .find(cmps => cmps.some(c => isKey(c) && ('doorIdx' in c) && c.doorIdx === targetIdx))
    ) {
      openDoor(targetX, targetY) 
      let name, verb;
      if (entity === player) {
        name = 'You';
        verb = 'unlock and open';
      } else if (
        playerViewshed.visibleCells.has(targetIdx) &&
        playerViewshed.visibleCells.has(openerIdx)
      ) {
        const nameCmp = entityCmp.get(Name) as Name;
        name = nameCmp ? `The ${nameCmp.name}` : 'Someone';
        verb = 'unlocks and opens';
      }
      if (name && verb) {
        let str = `${name} ${verb} the door.`;
        state.log(str);
      }
    } else {
      if (entity === player) {
        state.log('The door is locked.')
      }
    }
  }
}

const openDoor = (targetX, targetY) => {
  const cell = state.map.getCell(targetX, targetY);
  if ([CellType.DOOR_CLOSED, CellType.DOOR_LOCKED].includes(cell)) {
    state.map.setCell(targetX, targetY, CellType.DOOR_OPEN);
    const entities = state.world.findEntitiesByComponents([Viewshed]);
    for (const [entity, cmp] of entities) {
      const viewshed = cmp.find(isViewshed);
      if (viewshed) viewshed.dirty = true;
    }
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

  const targetPosition = state.world.getComponentMap(target).get(Position) as Position;
  const dx = targetPosition.x - position.x;
  const dy = targetPosition.y - position.y;
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) { return; }

  if (target) {
    handleReceiveDamage(target, entity);
  }
}

export const handleReceiveDamage = (victim: string, attacker: string): void => {
  const player = state.getState().player;
  const victimCmp = state.world.getComponentMap(victim);
  const attackerCmp = state.world.getComponentMap(attacker);
  const health = victimCmp.get(Health) as Health;
  const source = attackerCmp.get(MeleeCombat) as MeleeCombat;
  const name = attackerCmp.get(Name) as Name;
  if (!health || !source || health.dead) { return; }
  const victimNameCmp = victimCmp.get(Name) as Name;
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

export const handleDeath = (victim: string) => {
  const player = state.getState().player;
  const victimCmp = state.world.getComponentMap(victim);
  const inventory = victimCmp.get(Inventory) as Inventory;
  if (inventory && inventory.contents.length > 0) {
    inventory.contents.forEach(e => {
      dropItem(victim, e);
    });
  }
  if (victim === player) {
    state.log(`You are dead!`);
  } else {
    const name = victimCmp.get(Name) as Name;
    const nameStr = name ? `The ${name.name}` : 'It';
    state.log(`${nameStr} is dead!`);
  } 
  [AI, Body, Health, MeleeCombat, Inventory, Viewshed].forEach(type => {
    state.world.removeComponentByType(victim, type);
  });
  const glyph = victimCmp.get(Glyph) as Glyph;
  glyph.glyph = '%';
  const name = victimCmp.get(Name) as Name;
  if (name) { name.name = `dead ${name.name}`; }

  state.world.registerComponent(victim, {
    _type: Item,
    weight: 2,
  } as Item);
}

export const handlePickup = (entity: string, components: BaseComponent[]): void => {
  const pickupIntent = components.find(isIntentOfType('PICK_UP'));
  if (pickupIntent) {
    const itemCmp = state.world.getComponentMap(pickupIntent.payload.target);
    const item = itemCmp.get(Item) as Item;
    const name = itemCmp.get(Name) as Name;
    const inventory  = state.world.getComponentMap(entity).get(Inventory) as Inventory;
    const remainingCapacity = inventory.capacity - inventory.contents.reduce((sum, e) => {
      const item = state.world.getComponentMap(e).get(Item) as Item;
      return sum + item.weight;
    }, 0);
    if (inventory && item.weight > remainingCapacity && entity === state.getState().player) {
      state.log(`The ${name.name} is too heavy to pick up.`);
    } else { 
      item.owner = entity;
      inventory.contents.push(pickupIntent.payload.target);
      if (entity === state.getState().player) {
        state.log(`You pick up the ${name.name}.`);
      } 
    } 
  }
}

export const handleDrop = (entity: string, components: BaseComponent[]): void => {
  const dropIntent = components.find(isIntentOfType('DROP_ITEM'));
  const droppedItem = dropIntent.payload.item;
  if (dropIntent && droppedItem) {
    dropItem(entity, droppedItem); 
  }
}

const dropItem = (entity: string, droppedItem: string) => {
  const itemCmp = state.world.getComponentMap(droppedItem);
  const item = itemCmp.get(Item) as Item;
  const name = itemCmp.get(Name) as Name;
  const inventory  = state.world.getComponentMap(entity).get(Inventory) as Inventory; 
  item.owner = null;
  inventory.contents = inventory.contents.filter(e => e !== droppedItem);
  if (entity === state.getState().player) {
    state.log(`You drop the ${name.name}.`);
  } else {
    const entityName = state.world.getComponentMap(entity).get(Name) as Name;
    state.log(`${entityName ? 'The ' + entityName.name : 'Someone'} drops a ${name.name}.`);
  }
}
