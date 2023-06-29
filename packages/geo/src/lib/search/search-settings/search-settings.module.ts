import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchSettingsComponent } from './search-settings.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoLanguageModule } from '@igo2/core';

/**
 * @ignore
 */
@NgModule({
  declarations: [SearchSettingsComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSlideToggleModule,
    IgoLanguageModule
  ],
  exports: [SearchSettingsComponent]
})
export class IgoSearchSettingsModule { }
