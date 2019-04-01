import { ActionStore } from '../../action';
import { EntityStore, EntityTableTemplate } from '../../entity';

export interface EditorConfig {
  id: string;
  title: string;
  tableTemplate?: EntityTableTemplate;
  entityStore?: EntityStore<object>;
  actionStore?: ActionStore;
}
