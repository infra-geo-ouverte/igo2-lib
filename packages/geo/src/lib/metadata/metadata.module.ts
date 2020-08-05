import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  static forRoot(): ModuleWithProviders<IgoMetadataModule> {
    return {
      ngModule: IgoMetadataModule,
      providers: []
    };
  }
}
