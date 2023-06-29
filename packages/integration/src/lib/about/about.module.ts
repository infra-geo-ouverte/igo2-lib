import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';

import { IgoLanguageModule } from '@igo2/core';
import { IgoCustomHtmlModule, IgoInteractiveTourModule } from '@igo2/common';

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
    CommonModule
  ],
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
