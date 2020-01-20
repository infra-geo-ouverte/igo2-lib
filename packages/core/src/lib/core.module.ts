import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

import { IgoActivityModule } from './activity/activity.module';
import { IgoConfigModule } from './config/config.module';
import { IgoLanguageModule } from './language/language.module';
import { IgoMessageModule } from './message/message.module';
import { IgoErrorModule } from './request/error.module';
import { IgoStyleListModule } from './style/style-list.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    IgoActivityModule.forRoot(),
    IgoConfigModule.forRoot(),
    IgoErrorModule.forRoot(),
    IgoLanguageModule.forRoot(),
    IgoMessageModule.forRoot(),
    IgoStyleListModule.forRoot()
  ],
  declarations: [],
  exports: [
    IgoActivityModule,
    IgoConfigModule,
    IgoErrorModule,
    IgoLanguageModule,
    IgoMessageModule,
    IgoStyleListModule
  ]
})
export class IgoCoreModule {
  static forRoot(): ModuleWithProviders {
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
