import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { CustomHtmlComponent } from './custom-html.component';
import { SanitizeHtmlPipe } from './custom-html.pipe';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    MatButtonModule,
    IgoLanguageModule
  ],
  exports: [SanitizeHtmlPipe, CustomHtmlComponent],
  declarations: [SanitizeHtmlPipe, CustomHtmlComponent]
})
export class IgoCustomHtmlModule {
  static forRoot(): ModuleWithProviders<IgoCustomHtmlModule> {
    return {
      ngModule: IgoCustomHtmlModule
    };
  }
}
