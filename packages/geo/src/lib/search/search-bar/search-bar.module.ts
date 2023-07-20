import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { IgoSearchSelectorModule } from '../search-selector/search-selector.module';
import { IgoSearchSettingsModule } from '../search-settings/search-settings.module';
import { SearchBarComponent } from './search-bar.component';
import { SearchUrlParamDirective } from './search-url-param.directive';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    IgoLanguageModule,
    IgoSearchSelectorModule,
    IgoSearchSettingsModule
  ],
  exports: [
    SearchBarComponent,
  ],
  declarations: [
    SearchBarComponent,
    SearchUrlParamDirective
  ]
})
export class IgoSearchBarModule {}
