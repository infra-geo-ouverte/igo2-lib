import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadToolComponent } from './download-tool';
import { MatCarouselModule } from '@ngbmodule/material-carousel';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleRequiredValidator } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  imports: [
    CommonModule,
    MatCarouselModule,
    MatCardModule,
    MatSliderModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule
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
