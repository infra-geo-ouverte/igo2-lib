import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoContextModule } from './context/context.module';
import { IgoContextMapButtonModule } from './context-map-button/context-map-button.module';
import { IgoShareMapModule } from './share-map/share-map.module';
import { IgoSidenavModule } from './sidenav/sidenav.module';
import { IgoToolModule } from './tool/tool.module';

@NgModule({
  imports: [],
  declarations: [],
  exports: [
    IgoContextModule,
    IgoContextMapButtonModule,
    IgoShareMapModule,
    IgoSidenavModule,
    IgoToolModule
  ]
})
export class IgoGeoContextModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoGeoContextModule,
      providers: []
    };
  }
}
