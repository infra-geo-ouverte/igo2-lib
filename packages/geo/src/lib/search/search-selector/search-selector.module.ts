import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatTooltipModule,
  MatIconModule,
  MatButtonModule,
  MatMenuModule,
  MatRadioModule,
  MatTabsModule,
  MatCheckboxModule
} from '@angular/material';

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
