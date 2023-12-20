import { ModuleWithProviders, NgModule } from '@angular/core';

/**
 * @deprecated UNUSED
 */
@NgModule({
  imports: [],
  exports: [],
  declarations: []
})
export class IgoWktModule {
  static forRoot(): ModuleWithProviders<IgoWktModule> {
    return {
      ngModule: IgoWktModule,
      providers: []
    };
  }
}
