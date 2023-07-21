import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

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
