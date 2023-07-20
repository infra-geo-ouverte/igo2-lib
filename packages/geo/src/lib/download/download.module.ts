import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
  static forRoot(): ModuleWithProviders<IgoDownloadModule> {
    return {
      ngModule: IgoDownloadModule
    };
  }
}
