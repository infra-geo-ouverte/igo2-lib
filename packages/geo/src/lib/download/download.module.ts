import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatIconModule,
  MatButtonModule,
  MatTooltipModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { DownloadButtonComponent } from './download-button/download-button.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IgoLanguageModule
  ],
  exports: [DownloadButtonComponent],
  declarations: [DownloadButtonComponent]
})
export class IgoDownloadModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoDownloadModule
    };
  }
}
