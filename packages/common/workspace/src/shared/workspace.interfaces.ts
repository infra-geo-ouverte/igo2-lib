import { ActionStore } from '@igo2/common/action';
import { EntityStore } from '@igo2/common/entity';

export interface WorkspaceOptions {
  id: string;
  title: string;
  entityStore?: EntityStore<object>;
  actionStore?: ActionStore;
  meta?: Record<string, any>;
}
