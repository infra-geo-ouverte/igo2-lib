import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

import { IgoActivityModule } from './activity/activity.module';
import { IgoConfigModule } from './config/config.module';
import { IgoLanguageModule } from './language/language.module';
import { IgoMessageModule } from './message/message.module';
import { IgoErrorModule } from './request/error.module';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import { DownloadRegionService, TileDownloaderService } from './download';


const dbConfig: DBConfig = {
  name: 'igo2DB',
  version: 1,
  objectStoresMeta: [{
    store: 'geoData',
    storeConfig: { keyPath: 'url', autoIncrement: false },
    storeSchema: [
    ]
  }, {
    store: 'regionData',
    storeConfig: { keyPath:'id', autoIncrement: true},
    storeSchema: [
      { name: 'name', keypath: 'name', options:{ unique: false }}
    ]
  }]
};
//      { name: 'region_id', keypath: 'region_id', options:{ unique: false}}

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
