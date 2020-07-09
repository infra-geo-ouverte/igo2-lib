import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoLanguageModule } from '@igo2/core';
import { IgoCustomHtmlModule } from '@igo2/common';

import { AboutToolComponent } from './about-tool/about-tool.component';

@NgModule({
  imports: [IgoLanguageModule, IgoCustomHtmlModule],
  declarations: [AboutToolComponent],
  exports: [AboutToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppAboutModule {
  static forRoot(): ModuleWithProviders<IgoAppAboutModule> {
    return {
      ngModule: IgoAppAboutModule,
      providers: []
    };
  }
}
