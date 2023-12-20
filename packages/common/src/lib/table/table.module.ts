import { ModuleWithProviders, NgModule } from '@angular/core';

import { TableComponent } from './table.component';

/**
 * @deprecated import the TableComponent directly
 */
@NgModule({
  imports: [TableComponent],
  exports: [TableComponent]
})
export class IgoTableModule {
  static forRoot(): ModuleWithProviders<IgoTableModule> {
    return {
      ngModule: IgoTableModule,
      providers: []
    };
  }
}
