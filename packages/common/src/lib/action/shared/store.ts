import { EntityStore } from '../../entity';
import { Action } from './action.interfaces';

/**
 * The class is a specialized version of an EntityStore that stores
 * actions.
 */
export class ActionStore extends EntityStore<Action> {

  /**
   * Update actions availability. That means disabling or enabling some
   * actions based on the conditions they define.
   */
  updateActionsAvailability() {
    const availables = [];
    const unavailables = [];

    this.entities$.value.forEach((action: Action) => {
      const conditions = action.conditions || [];
      const available = conditions.every((condition: () => boolean) => condition());
      available ? availables.push(action) : unavailables.push(action);
    });

    if (unavailables.length > 0) {
      this.state.updateMany(unavailables, {
        disabled: true,
        active: false
      });
    }

    if (availables.length > 0) {
      this.state.updateMany(availables, {
        disabled: false
      });
    }
  }

}
