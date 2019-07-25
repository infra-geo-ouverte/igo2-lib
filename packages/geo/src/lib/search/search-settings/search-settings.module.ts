import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchSettingsComponent } from './search-settings.component';
import {
  MatTooltipModule,
  MatIconModule,
  MatButtonModule,
  MatMenuModule,
  MatRadioModule,
  MatCheckboxModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { IgoSearchSelectorModule } from '../search-selector/search-selector.module';

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
    IgoSearchSelectorModule,
    IgoLanguageModule
  ],
  exports: [SearchSettingsComponent]
})
export class IgoSearchSettingsModule { }
