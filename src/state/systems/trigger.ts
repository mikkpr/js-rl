import { BaseComponent, System } from 'ecs-machina';
import { match } from 'egna';
import state from '..';

import {
  Position,
  isPosition,
  Trigger,
  isTrigger,
  Item,
  Body,
  Health,
} from '../components';
import {
  handleDeath
} from '../systems/intent';

export class TriggerSystem extends System {  
  public requiredComponents = [Trigger, Position];

  public updateEntity(entity: string, components: BaseComponent[]): void {
    const player = state.getState().player;
    const [isTriggered, entities] = checkForCondition(entity, components);
    const triggerComponent = components.find(isTrigger)!;
    const position = components.find(isPosition)!;
    const event = triggerComponent!.event;
    if (!triggerComponent.triggered && isTriggered) { 
      if (triggerComponent.messages && triggerComponent.messages.trigger) {
        const playerPos = state.world.getComponentMap!(player).get(Position) as Position;
        if (playerPos.x === position.x && playerPos.y === position.y) {
          state.log(triggerComponent.messages.trigger);
        }
      }
      if (triggerComponent.repeat !== 'REPEAT') {
        triggerComponent.triggered = true;
      }
      if (event) {
        applyTriggerEvent(event, entities);
      }
    } else if (triggerComponent.triggered && !isTriggered && triggerComponent.repeat === 'TOGGLE') {
      if (triggerComponent.messages && triggerComponent.messages.revert) {
        const playerPos = state.world.getComponentMap!(player).get(Position) as Position;
        if (playerPos.x === position.x && playerPos.y === position.y) {
          state.log(triggerComponent.messages.revert);
        }
      }
      triggerComponent.triggered = false;
      if (event) {
        revertTriggerEvent(event, entities);
      }
    }
  }
}

const checkForCondition = (entity: string, components: BaseComponent[]): [boolean, string[]]=> {
  const triggerComponent = components.find(isTrigger)!;
  const checker = match(
    { type: 'ENTER' }, checkEnterCondition,
    { type: 'WEIGHT' }, checkWeightCondition 
  )(triggerComponent.condition);
  if (checker) {
    return checker(entity, components);
  }
  return [false, []];
}

const checkWeightCondition = (condition) => (entity: string, components: BaseComponent[]) => {
  const pos = components.find(isPosition);
  if (!pos) { return [false, []]; }
  const idx = state.map.getIdx(pos.x, pos.y);
  const entities = state.map.entities.get(idx!);
  if (!entities || entities.length === 0) {
    return [false, []];
  }
  const applicableEntities = entities
    .filter(e => e !== entity)
    .map(e => state.world.getComponentMap!(e))
    .filter(m => m.has(Body) || m.has(Item));
  const totalWeight = applicableEntities 
    .reduce((sum, m) => {
      const body = m.get(Body) as Body;
      const item = m.get(Item) as Item;
      if (body && body.weight) {
        return sum + body.weight;
      } else if (item && item.weight) {
        return sum + item.weight;
      } 
      return sum;
    }, 0);
  const triggered = condition.amount <= totalWeight;
  return [triggered, triggered ? applicableEntities : []];
}

const checkEnterCondition = (condition) => (entity: string, components: BaseComponent[]) => {
  const pos = components.find(isPosition);
  if (!pos) { return [false, []]; }
  const idx = state.map.getIdx(pos.x, pos.y);
  const entities = state.map.entities.get(idx!);
  if (!entities || entities.length === 0) {
    return [false, []];
  }
  const e = entities.filter(e => {
    const body = state.world.getComponentMap(e).get(Body) as Body;
    return !!body; 
  });
  const triggered = e.length > 0;
  return [triggered, triggered ? e : []];
};

const applyTriggerEvent = (event, entities) => {
  if (event.type === 'CHANGE_CELL')  {
    state.map.setCell(event.idx, event.newType);
  } else if (event.type === 'DEAL_DAMAGE') {
    entities.forEach(e => {
      const health = state.world.getComponentMap(e).get(Health) as Health;
      if (health) {
        health.health -= event.amount;
        if (health.health <= 0) {
          handleDeath(e);
        }
      }
    })
  }
}

const revertTriggerEvent = (event, entities) => {
  if (event.type === 'CHANGE_CELL') {
    state.map.setCell(event.idx, event.oldType);
  } else if (event.type === 'DEAL_DAMAGE') {
    // TODO?
  }
}