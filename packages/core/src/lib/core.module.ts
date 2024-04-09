import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { IgoActivityModule } from '@igo2/core/activity';
import { IgoConfigModule } from '@igo2/core/config';
import { IgoLanguageModule, provideRootTranslation } from '@igo2/core/language';
import { IgoMessageModule } from '@igo2/core/message';
import { IgoErrorModule } from '@igo2/core/request';

import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';

const dbConfig: DBConfig = {
  name: 'igo2DB',
  version: 2,
  objectStoresMeta: [
    {
      store: 'geoData',
      storeConfig: { keyPath: 'url', autoIncrement: false },
      storeSchema: [
        {
          name: 'regionIDs',
          keypath: 'regionIDs',
          options: { multiEntry: true, unique: false }
        }
      ]
    },
    {
      store: 'layerData',
      storeConfig: { keyPath: 'layerId', autoIncrement: false },
      storeSchema: [
        {
          name: 'layerOptions',
          keypath: 'layerOptions',
          options: { unique: false }
        },
        {
          name: 'sourceOptions',
          keypath: 'sourceOptions',
          options: { unique: false }
        }
      ]
    }
  ]
};
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    IgoActivityModule.forRoot(),
    IgoConfigModule.forRoot(),
    IgoErrorModule.forRoot(),
    IgoMessageModule,
    NgxIndexedDBModule.forRoot(dbConfig)
  ],
  providers: [provideRootTranslation()],
  declarations: [],
  exports: [
    IgoActivityModule,
    IgoConfigModule,
    IgoErrorModule,
    IgoLanguageModule,
    IgoMessageModule
  ]
})
export class IgoCoreModule {
  /**
   * @deprecated it has no effect
   */
  static forRoot(): ModuleWithProviders<IgoCoreModule> {
    return {
      ngModule: IgoCoreModule,
      providers: []
    };
  }

  constructor() {}
}
