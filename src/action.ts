const ACTION_MODIFIERS = {
  RECEIVE_DAMAGE: {
    FireResistance: component => (action, actor) => {
      if (!(action.payload.damage.find(d => d.type === 'fire'))) {
        return action;
      }
      const modify = amount => ~~(amount * 0.5);
      const modifiedPayload = {
        ...action.payload,
        damage: action.payload.damage.map(d => d.type === 'fire'
          ? { ...d, amount: modify(d.amount) }
          : d
        )
      };
      debugModifier({
        payload: action.payload,
        modifiedPayload,
        actor,
        type: 'RECEIVE_DAMAGE',
        component: 'FireResistance'
      })
      return {
        ...action,
        payload: modifiedPayload 
      }
    },
    Armor: component => (action, actor) => {
      const damageTypes = [
        'crushing',
        'slashing',
        'cleaving'
      ];
      if (!(action.payload.damage.find(d => damageTypes.includes(d.type)))) {
        return action;
      }
      const modify = amount => Math.max(0, amount - component.armor);
      const modifiedPayload = {
        ...action.payload,
        damage: action.payload.damage.map(d => damageTypes.includes(d.type)
          ? { ...d, amount: modify(d.amount) }
          : d
        ) 
      };
      debugModifier({
        modifiedPayload,
        payload: action.payload,
        actor,
        type: 'RECEIVE_DAMAGE',
        component: 'Armor'
      });

      return {
        ...action,
        payload: modifiedPayload 
      };
    }
  },
  DEAL_DAMAGE: {
    Weapon: component => (action, actor) => {
      const { damage, type } = component;
      const modifiedPayload = {
        ...action.payload,
        damage: [...action.payload.damage, {
          amount: damage,
          type: type
        }]
      };
      debugModifier({
        modifiedPayload,
        payload: action.payload,
        actor,
        type: 'DEAL_DAMAGE',
        component: 'Weapon'
      });

      return {
        ...action,
        payload: modifiedPayload 
      };
    },
    FireDamage: component => (action, actor) => {
      const fireDamage = component.damage;
      const modifiedPayload = {
        ...action.payload,
        damage: [...action.payload.damage, {
          amount: fireDamage,
          type: 'fire' 
        }]
      }; 
      debugModifier({
        modifiedPayload,
        payload: action.payload,
        actor,
        type: 'DEAL_DAMAGE',
        component: 'FireDamage'
      });

      return {
        ...action,
        payload: modifiedPayload 
      };
    } 
  },
  HEAL: {
    BonusHeal: component => (action, actor) => {
      const modifiedPayload = {
        ...action.payload,
        amount: action.payload.amount + component.bonus
      };
      debugModifier({
        modifiedPayload,
        payload: action.payload,
        actor,
        type: 'HEAL',
        component: 'BonusHeal'
      });

      return {
        ...action,
        payload: modifiedPayload 
      }
    }
  },
  MOVE: {
    DoubleMove: component => (action, actor) => {
      const modifiedPayload = {
        ...action.payload,
        dx: action.payload.dx * 2,
        dy: action.payload.dy * 2
      };
      debugModifier({
        modifiedPayload,
        payload: action.payload,
        actor,
        type: 'MOVE',
        component: 'DoubleMove'
      });

      return {
        ...action,
        payload: modifiedPayload 
      };
    },
    ShiftMove: component => (action, actor) => {
      const modifiedPayload = {
        ...action.payload,
        dx: action.payload.dx + component.deltaX,
        dy: action.payload.dy + component.deltaY
      };
      debugModifier({
        modifiedPayload,
        payload: action.payload,
        actor,
        type: 'MOVE',
        component: 'ShiftMove'
      });

      return {
        ...action,
        payload: modifiedPayload 
      };
    }
  }
};

/*
 * Takes an action, passes it along to every component
 * of the actor that can react to it and then returns the final
 * version of the action, modified by all the components.
 */
const resolve = (action, actor) => {
  const modifiers = ACTION_MODIFIERS[action.type] || {};
  return Object.keys(modifiers).reduce((act, type) => {
    const cmp = getComponent(actor, type);
    if (!act || !cmp) { return act; }
    const modified = modifiers[type](cmp)(act, actor);
    return modified;
  }, action);
};

/*
 * executes the given action on the given actor (entity).
 * Doesn't really know if or how the action was modified, just passes it to
 * a corresponding handler (in this case, `move`).
 */
const execute = (action, actor) => {
  console.log(`[${actor.id}]:`, action.type, action.payload)
  const finalAction = resolve(action, actor);
  if (!finalAction) { return false; }

  const actionHandlers = {
    MOVE: move,
    CONSUME: consume,
    HEAL: heal,
    DEAL_DAMAGE: dealDamage,
    RECEIVE_DAMAGE: receiveDamage,
    USE: use,
    ATTACK: attack,
  };
  const handler = finalAction.type ? actionHandlers[finalAction.type] : false;
  if (!handler) { return false; }

  return handler(finalAction, actor); 
};

// modifies the position component of the actor.
// Doesn't know the origin of the action and doesn't care, really.
const move = (action, actor) => {
  const pos = getComponent(actor, "Position", true);
  if (!pos) {
    return;
  }
  pos.x += action.payload.dx;
  pos.y += action.payload.dy;
};

const consume = (action, actor) => {
  const itemID = action.payload.item;
  const item = entities[itemID];
  if (!item) { return; }
  
  const consumable = getComponent(item, "Consumable", true);
  if (!consumable) { return; }

  const effects = consumable.effects;
  if (!effects || effects.length === 0) { return; }

  consumable.uses -= 1;
  for (const effect of effects) {
    execute(effect, actor);
  }
}

const use = (action, actor) => {
  const itemID = action.payload.item;
  const item = entities[itemID];
  if (!item) { return; }
  
  const usable = getComponent(item, "Usable", true);
  if (!usable) { return; }

  const effects = usable.effects;
  if (!effects || effects.length === 0) { return; }
  
  const targetID = action.payload.target;
  const target = entities[targetID];
  if (!target) { return; }

  usable.uses -= 1;
  for (const effect of effects) {
    const modifiedEffect = resolveWithItems(effect)(action, target);

    execute(modifiedEffect, target);
  }
}

const heal = (action, actor) => {
  const health = getComponent(actor, "Health", true);
  if (!health) { return; }

  health.health = Math.min(health.health + action.payload.amount, health.maxHealth);
};

const receiveDamage = (action, actor) => {
  const health = getComponent(actor, "Health", true);
  if (!health) { return; }

  const totalDamage = action.payload.damage.reduce((sum, d) => sum + d.amount, 0);

  health.health = Math.max(health.health - totalDamage, 0);
};

const dealDamage = (action, actor) => {
  const targetID = action.payload.target;
  const target = entities[targetID];
  if (!target) { return false; }

  const receiveDamageAction = resolveWithItems({
    type: 'RECEIVE_DAMAGE',
    payload: {
      damage: action.payload.damage 
    }
  })(action, target);

  execute(receiveDamageAction, target);
};

const attack = (action, actor) => {
  const targetID = action.payload.target;
  const target = entities[targetID];
  if (!target) { return false; }

  // TODO attack calculation here?
 
  const dealDamageAction = resolveWithItems({
    type: 'DEAL_DAMAGE',
    payload: {
      damage: [],
      target: action.payload.target
    }
  })(action, actor);

  execute(dealDamageAction, actor);
}

// opening a door
// picking up something?        

// DATA
const player = {
  id: "1",
  components: [
    {
      _type: "Name",
      name: "Player"
    },
    {
      _type: "Position",
      x: 0,
      y: 0
    },
    {
      _type: "DoubleMove"
    }, {
      _type: "Health",
      health: 3,
      maxHealth: 10
    }, {
      _type: 'BonusHeal',
      bonus: 2
    }
  ]
};

const potion = {
  id: "2",
  components: [
    {
      _type: "Name",
      name: "minor healing potion"
    }, {
      _type: "Item",
      owner: "1"
    }, {
      _type: "Consumable",
      effects: [{
        type: 'HEAL',
        payload: {
          amount: 5
        }
      }],
      uses: 1
    }
  ]
}

const wand = {
  id: "3",
  components: [
    {
      _type: "Name",
      name: "wand of fireball"
    }, {
      _type: "Item",
      owner: "1"
    }, {
      _type: "Usable",
      effects: [{
        type: 'RECEIVE_DAMAGE',
        payload: {
          damage: [{
            amount: 5,
            type: 'fire'
          }]
        }
      }],
      uses: 3
    }
  ]
}

const fireSword = {
  id: "4",
  components: [
    {
      _type: "Name",
      name: "flaming sword"
    }, {
      _type: "Item",
      owner: "1"
    }, {
      _type: "FireDamage",
      damage: 4 
    }, {
      _type: "Weapon",
      damage: 5,
      type: 'slashing'
    }
  ]
}

const magmaHelmet = {
  id: "5",
  components: [
    {
      _type: "Name",
      name: "magma helmet"
    }, {
      _type: "Item",
      owner: "6"
    }, {
      _type: "Armor",
      armor: 3
    }, {
      _type: "FireResistance"
    }
  ]
}

const kobold = {
  id: "6",
  components: [
    {
      _type: "Name",
      name: "kobold"
    }, {
      _type: "Health",
      health: 7,
      maxHealth:8 
    }
  ]
}

const entities = {
  "1": player,
  "2": potion,
  "3": wand,
  "4": fireSword,
  "5": magmaHelmet,
  "6": kobold
};

// A basic move action that tries to move the actor one unit along the x-axis
const moveAction = {
  type: "MOVE",
  payload: {
    dx: 1,
    dy: 0
  }
};

const drinkPotionAction = {
  type: "CONSUME",
  payload: {
    item: "2"
  }
};

const useWandAction = {
  type: 'USE',
  payload: {
    item: "3",
    target: "6"
  }
};

const attackAction = {
  type: 'ATTACK',
  payload: {
    target: "6"
  }
};

// helper function that tries to retrieve a specific component by name
const getComponent = (actor, type, mutable = false) => {
  const component = actor.components.find(c => c._type === type);
  if (!component) {
    return null;
  }

  if (mutable) {
    return component;
  }

  return JSON.parse(JSON.stringify(component));
};

const resolveWithItems = initial => (action, actor) => {
 return Object.values(entities)
  .filter(e => {
    const item = getComponent(e, 'Item');
    return (!!item && item.owner === actor.id);
  })
  .reduce((act, e) => {
    return resolve(act, e);
  }, initial);
}

const debugModifier = ({
  type,
  component,
  actor,
  payload,
  modifiedPayload
}) => {
  console.log(`  ${type} on [${getComponent(actor, 'Name').name}].[${component}] (${JSON.stringify(getComponent(actor, component))}):\n    before: ${JSON.stringify(payload)}\n    after: ${JSON.stringify(modifiedPayload)}`);
}

// check the console
console.log('-- moving --');
console.log("BEFORE:", getComponent(player, "Position"));
execute(moveAction, player);
console.log("AFTER:", getComponent(player, "Position"));

console.log('\n')
console.log('-- drinking a potion --');
console.log("BEFORE:", getComponent(player, "Health"));
execute(drinkPotionAction, player);
console.log("AFTER:", getComponent(player, "Health"));

console.log('\n')
console.log('-- using a wand on someone --');
console.log("BEFORE:", getComponent(kobold, "Health"));
execute(useWandAction, player);
console.log("AFTER:", getComponent(kobold, "Health"));

console.log('\n')
console.log('-- attacking someone --');
console.log("BEFORE:", getComponent(kobold, "Health"));
execute(attackAction, player);
console.log("AFTER:", getComponent(kobold, "Health"));


