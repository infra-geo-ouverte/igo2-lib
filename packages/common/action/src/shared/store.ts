import { EntityStore } from '@igo2/common/entity';

import { Action } from './action.interfaces';

/**
 * The class is a specialized version of an EntityStore that stores
 * actions.
 */
export class ActionStore extends EntityStore<Action> {}
