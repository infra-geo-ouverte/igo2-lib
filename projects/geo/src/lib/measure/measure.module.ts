import { NgModule, ModuleWithProviders } from '@angular/core';

import { MeasureDirective } from './shared/measure.directive';

@NgModule({
  imports: [],
  exports: [MeasureDirective],
  declarations: [MeasureDirective]
})
export class IgoMeasureModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoMeasureModule
    };
  }
}
