import { ActionStore } from '../../action';
import { EntityStore, EntityTableTemplate } from '../../entity';

export interface EditorOptions {
  id: string;
  title: string;
  tableTemplate?: EntityTableTemplate;
  entityStore?: EntityStore<object>;
  actionStore?: ActionStore;
}
