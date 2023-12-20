import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { DownloadButtonComponent } from './download-button/download-button.component';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        IgoLanguageModule,
        DownloadButtonComponent
    ],
    exports: [DownloadButtonComponent]
})
export class IgoDownloadModule {
  static forRoot(): ModuleWithProviders<IgoDownloadModule> {
    return {
      ngModule: IgoDownloadModule
    };
  }
}
