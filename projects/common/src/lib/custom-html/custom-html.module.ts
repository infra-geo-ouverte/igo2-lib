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

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    MatButtonModule,
    IgoLanguageModule
  ],
  exports: [CustomHtmlComponent],
  declarations: [CustomHtmlComponent]
})
export class IgoCustomHtmlModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCustomHtmlModule
    };
  }
}
