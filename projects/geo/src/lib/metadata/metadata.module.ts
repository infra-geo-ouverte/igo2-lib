import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatIconModule,
  MatButtonModule,
  MatTooltipModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { MetadataButtonComponent } from './metadata-button/metadata-button.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IgoLanguageModule
  ],
  exports: [MetadataButtonComponent],
  declarations: [MetadataButtonComponent]
})
export class IgoMetadataModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoMetadataModule,
      providers: []
    };
  }
}
