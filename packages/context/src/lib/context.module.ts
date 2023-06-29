import { NgModule, ModuleWithProviders } from '@angular/core';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';

import { IgoContextImportExportModule } from './context-import-export/context-import-export.module';
import { IgoContextManagerModule } from './context-manager/context-manager.module';
import { IgoContextMapButtonModule } from './context-map-button/context-map-button.module';
import { IgoShareMapModule } from './share-map/share-map.module';
import { IgoSidenavModule } from './sidenav/sidenav.module';

@NgModule({
  imports: [MatInputModule, MatFormFieldModule, MatMenuModule],
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
      ngModule: IgoContextModule,
      providers: []
    };
  }
}
