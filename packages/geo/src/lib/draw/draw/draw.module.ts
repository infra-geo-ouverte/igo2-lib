import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { ColorPickerModule } from 'ngx-color-picker';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule } from '@igo2/common';
import { DrawComponent } from './draw.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DrawPopupComponent } from './draw-popup.component';
import { DrawShorcutsComponent } from './draw-shorcuts.component';
import { DrawLayerPopupComponent } from './draw-layer-popup.component';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';


/**
 * @ignore
 */
@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDialogModule,
    IgoLanguageModule,
    IgoEntityTableModule,
    ColorPickerModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatRadioModule,
    MatCheckboxModule
  ],
  declarations: [DrawComponent, DrawPopupComponent, DrawLayerPopupComponent, DrawShorcutsComponent],
  exports: [DrawComponent]
})
export class IgoDrawModule {}
