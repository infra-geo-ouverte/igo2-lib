import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoCustomHtmlModule, IgoInteractiveTourModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { AboutToolComponent } from './about-tool/about-tool.component';

@NgModule({
    imports: [
        IgoLanguageModule,
        IgoCustomHtmlModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        IgoInteractiveTourModule,
        CommonModule,
        AboutToolComponent
    ],
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
