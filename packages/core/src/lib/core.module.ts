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

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    IgoActivityModule.forRoot(),
    IgoConfigModule.forRoot(),
    IgoErrorModule.forRoot(),
    IgoLanguageModule.forRoot(),
    IgoMessageModule.forRoot()
  ],
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
