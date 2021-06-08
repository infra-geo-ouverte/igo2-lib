import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadToolComponent } from './download-tool';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { IgoCustomHtmlModule } from '@igo2/common/public_api';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [DownloadToolComponent],
  exports: [DownloadToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppDownloadModule {
  static forRoot(): ModuleWithProviders<IgoAppDownloadModule> {
    return {
      ngModule: IgoAppDownloadModule,
      providers: []
    };
  }
 }
