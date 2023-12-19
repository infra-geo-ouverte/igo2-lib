import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule
} from '@angular/core';

import { IgoDirectionsModule } from '@igo2/geo';

import { DirectionsToolComponent } from './directions-tool/directions-tool.component';

@NgModule({
  imports: [IgoDirectionsModule],
  declarations: [DirectionsToolComponent],
  exports: [DirectionsToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppDirectionsModule {
  static forRoot(): ModuleWithProviders<IgoAppDirectionsModule> {
    return {
      ngModule: IgoAppDirectionsModule,
      providers: []
    };
  }
}
