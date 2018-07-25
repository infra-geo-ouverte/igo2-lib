import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoShareMapModule } from '@igo2/context';
import { ShareMapToolComponent } from './share-map-tool.component';

@NgModule({
  imports: [IgoShareMapModule],
  declarations: [ShareMapToolComponent],
  exports: [ShareMapToolComponent],
  entryComponents: [ShareMapToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoShareMapToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoShareMapToolModule,
      providers: []
    };
  }
}
