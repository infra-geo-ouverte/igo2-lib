import { ActionStore } from '@igo2/common/action';
import { EntityStore } from '@igo2/common/entity';

export interface WorkspaceOptions<T = { [key: string]: any }> {
  id: string | number;
  title: string;
  entityStore?: EntityStore<object>;
  actionStore?: ActionStore;
  meta?: T;
}
