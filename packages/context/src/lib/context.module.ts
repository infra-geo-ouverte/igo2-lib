import { ModuleWithProviders, NgModule } from '@angular/core';

import { IgoContextImportExportModule } from './context-import-export/context-import-export.module';
import { IgoContextManagerModule } from './context-manager/context-manager.module';
import { IgoContextMapButtonModule } from './context-map-button/context-map-button.module';
import { IgoShareMapModule } from './share-map/share-map.module';
import { IgoSidenavModule } from './sidenav/sidenav.module';

/**
 * @deprecated import the components/directives directly or SHARE_MAP_DIRECTIVES for the set
 */
@NgModule({
  declarations: [],
  exports: [
    IgoContextImportExportModule,
    IgoContextManagerModule,
    IgoContextMapButtonModule,
    IgoShareMapModule,
    IgoSidenavModule
  ]
})
export class IgoContextModule {
  static forRoot(): ModuleWithProviders<IgoContextModule> {
    return {
      ngModule: IgoContextModule
    };
  }
}
