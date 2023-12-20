import { ModuleWithProviders, NgModule } from '@angular/core';

import { DirectionsToolComponent } from './directions-tool/directions-tool.component';

/**
 * @deprecated import the DirectionsToolComponent directly
 */
@NgModule({
  imports: [DirectionsToolComponent],
  exports: [DirectionsToolComponent]
})
export class IgoAppDirectionsModule {
  static forRoot(): ModuleWithProviders<IgoAppDirectionsModule> {
    return {
      ngModule: IgoAppDirectionsModule,
      providers: []
    };
  }
}
