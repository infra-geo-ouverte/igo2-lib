import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoEntitySelectorModule } from './entity-selector/entity-selector.module';
import { IgoEntityTableModule } from './entity-table/entity-table.module';
import { IgoEntityTablePaginatorModule } from './entity-table-paginator/entity-table-paginator.module';
import { IgoSimpleFeatureListModule } from './simple_igo2/simple-feature-list/simple-feature-list.module';
import { IgoSimpleFiltersModule } from './simple_igo2/simple-filters/simple-filters.module';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    IgoEntitySelectorModule,
    IgoEntityTableModule,
    IgoEntityTablePaginatorModule,
    IgoSimpleFeatureListModule,
    IgoSimpleFiltersModule
  ],
  declarations: []
})
export class IgoEntityModule {}
