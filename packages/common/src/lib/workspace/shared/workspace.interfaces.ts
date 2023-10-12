import { ActionStore } from '../../action';
import { EntityStore } from '../../entity';

export interface WorkspaceOptions<T = { [key: string]: any }> {
  id: string;
  title: string;
  entityStore?: EntityStore<object>;
  actionStore?: ActionStore;
  meta?: T;
}
