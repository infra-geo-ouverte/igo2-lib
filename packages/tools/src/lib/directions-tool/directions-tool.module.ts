import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoRoutingModule } from '@igo2/geo';
import { DirectionsToolComponent } from './directions-tool.component';

@NgModule({
  imports: [IgoRoutingModule],
  declarations: [DirectionsToolComponent],
  exports: [DirectionsToolComponent],
  entryComponents: [DirectionsToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoDirectionsToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoDirectionsToolModule,
      providers: []
    };
  }
}
