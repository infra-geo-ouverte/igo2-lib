import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatIconModule,
  MatTooltipModule,
  MatInputModule,
  MatButtonModule
} from '@angular/material';

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
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCustomHtmlModule
    };
  }
}
