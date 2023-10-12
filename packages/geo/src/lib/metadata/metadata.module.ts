import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';

import {
  MetadataAbstractComponent,
  MetadataButtonComponent
} from './metadata-button/metadata-button.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IgoLanguageModule,
    MatDialogModule
  ],
  exports: [MetadataButtonComponent, MetadataAbstractComponent],
  declarations: [MetadataButtonComponent, MetadataAbstractComponent]
})
export class IgoMetadataModule {
  static forRoot(): ModuleWithProviders<IgoMetadataModule> {
    return {
      ngModule: IgoMetadataModule,
      providers: []
    };
  }
}
