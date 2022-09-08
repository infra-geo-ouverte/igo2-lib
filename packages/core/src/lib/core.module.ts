import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import { IgoActivityModule } from './activity/activity.module';
import { IgoConfigModule } from './config/config.module';
import { DownloadRegionService, TileDownloaderService } from './download';
import { IgoLanguageModule } from './language/language.module';
import { IgoMessageModule } from './message/message.module';
import { IgoErrorModule } from './request/error.module';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';

const dbConfig: DBConfig = {
  name: 'igo2DB',
  version: 1,
  objectStoresMeta: [{
    store: 'geoData',
    storeConfig: { keyPath: 'url', autoIncrement: false },
    storeSchema: [
      { name: 'regionID', keypath: 'regionID', options: { unique: false }}
    ]
  }]
};
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    IgoActivityModule.forRoot(),
    IgoConfigModule.forRoot(),
    IgoErrorModule.forRoot(),
    IgoLanguageModule.forRoot(),
    IgoMessageModule.forRoot(),
    NgxIndexedDBModule.forRoot(dbConfig)
  ],
  declarations: [],
  exports: [
    IgoActivityModule,
    IgoConfigModule,
    IgoErrorModule,
    IgoLanguageModule,
    IgoMessageModule
  ],
  providers: [
    TileDownloaderService,
    DownloadRegionService
  ]
})
export class IgoCoreModule {
  static forRoot(): ModuleWithProviders<IgoCoreModule> {
    return {
      ngModule: IgoCoreModule,
      providers: []
    };
  }

  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl(
        './assets/igo2/core/icons/mdi.svg'
      )
    );
  }
}
