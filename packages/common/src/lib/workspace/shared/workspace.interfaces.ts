import { ActionStore } from '../../action';
import { EntityStore } from '../../entity';

export interface WorkspaceOptions {
  id: string;
  title: string;
  entityStore?: EntityStore<object>;
  actionStore?: ActionStore;
  meta?: { [key: string]: any };
}
