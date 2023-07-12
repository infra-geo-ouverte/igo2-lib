import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchSettingsComponent } from './search-settings.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

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
