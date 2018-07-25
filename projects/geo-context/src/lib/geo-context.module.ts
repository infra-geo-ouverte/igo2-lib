import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoContextModule } from './context/context.module';
import { IgoShareMapModule } from './share-map/share-map.module';
import { IgoToolModule } from './tool/tool.module';

@NgModule({
  imports: [],
  declarations: [],
  exports: [IgoContextModule, IgoShareMapModule, IgoToolModule]
})
export class IgoGeoContextModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoGeoContextModule,
      providers: []
    };
  }
}
