import { NgModule } from '@angular/core';

import { EntitySelectorComponent } from './entity-selector';
import { EntityTableComponent } from './entity-table';
import { EntityTablePaginatorComponent } from './entity-table-paginator';

export const ENTITY_DIRECTIVES = [
  EntitySelectorComponent,
  EntityTableComponent,
  EntityTablePaginatorComponent
] as const;

/**
 * @deprecated import the components directly or ENTITY_DIRECTIVES for every components/directives
 */
@NgModule({
  imports: [...ENTITY_DIRECTIVES],
  exports: [...ENTITY_DIRECTIVES]
})
export class IgoEntityModule {}
