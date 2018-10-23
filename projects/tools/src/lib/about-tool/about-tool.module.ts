import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoCustomHtmlModule } from '@igo2/common';

import { AboutToolComponent } from './about-tool.component';

@NgModule({
  imports: [IgoCustomHtmlModule],
  declarations: [AboutToolComponent],
  exports: [AboutToolComponent],
  entryComponents: [AboutToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAboutToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAboutToolModule,
      providers: []
    };
  }
}
