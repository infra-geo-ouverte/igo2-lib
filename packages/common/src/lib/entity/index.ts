import { EntitySelectorComponent } from './entity-selector/entity-selector.component';
import { EntityTablePaginatorComponent } from './entity-table-paginator';
import { EntityTableComponent } from './entity-table/entity-table.component';

export * from './shared';
export * from './entity-selector/entity-selector.component';
export * from './entity-table/entity-table.component';
export * from './entity-table-paginator/entity-table-paginator.component';
export * from './entity-table-paginator/entity-table-paginator.interface';

export const ENTITY_DIRECTIVES = [
  EntitySelectorComponent,
  EntityTableComponent,
  EntityTablePaginatorComponent
] as const;
