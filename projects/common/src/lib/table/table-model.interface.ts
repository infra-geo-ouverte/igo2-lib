import { TableActionColor } from './table-action-color.enum';

export interface TableColumn {
  name: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  displayed?: boolean;
}

export type ClickAction = (item: any) => void;

export interface TableAction {
  icon: string;
  color?: TableActionColor;
  click: ClickAction;
}

export interface TableModel {
  columns: TableColumn[];
  actions?: TableAction[];
}
