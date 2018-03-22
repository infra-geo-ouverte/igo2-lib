import { NgModule, ModuleWithProviders } from '@angular/core';

import { AnalyticsService } from './shared/analytics.service';

@NgModule({
    imports: [],
    declarations: [],
    exports: []
})

export class IgoAnalyticsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAnalyticsModule,
      providers: [AnalyticsService]
    };
  }
}
