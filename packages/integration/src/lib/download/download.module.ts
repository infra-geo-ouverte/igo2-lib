import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadToolComponent } from './download-tool';
import { MatCarouselModule } from '@ngbmodule/material-carousel';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    MatCarouselModule,
    MatCardModule,
    MatButtonModule
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
