import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { MetadataButtonComponent, MetadataAbstractComponent } from './metadata-button/metadata-button.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IgoLanguageModule,
    MatDialogModule
  ],
  exports: [
    MetadataButtonComponent,
    MetadataAbstractComponent],
  declarations: [
    MetadataButtonComponent,
    MetadataAbstractComponent]
})
export class IgoMetadataModule {
  static forRoot(): ModuleWithProviders<IgoMetadataModule> {
    return {
      ngModule: IgoMetadataModule,
      providers: []
    };
  }
}
