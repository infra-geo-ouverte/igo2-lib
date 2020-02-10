import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoDirectionsModule } from '@igo2/geo';
import { DirectionsToolComponent } from './directions-tool/directions-tool.component';

@NgModule({
  imports: [IgoDirectionsModule],
  declarations: [DirectionsToolComponent],
  exports: [DirectionsToolComponent],
  entryComponents: [DirectionsToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppDirectionsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAppDirectionsModule,
      providers: []
    };
  }
}
