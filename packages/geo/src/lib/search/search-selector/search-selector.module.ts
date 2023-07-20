import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { SearchSelectorComponent } from './search-selector.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatRadioModule,
    MatTabsModule,
    MatCheckboxModule,
    IgoLanguageModule
  ],
  exports: [SearchSelectorComponent],
  declarations: [SearchSelectorComponent]
})
export class IgoSearchSelectorModule {}
