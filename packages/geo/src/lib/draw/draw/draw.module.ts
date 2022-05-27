import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { ColorPickerModule } from 'ngx-color-picker';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule } from '@igo2/common';
import { DrawComponent } from './draw.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DrawPopupComponent } from './draw-popup.component';
import { DrawShorcutsComponent } from './draw-shorcuts.component';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
    BrowserAnimationsModule
  ],
  declarations: [DrawComponent, DrawPopupComponent, DrawShorcutsComponent],
  exports: [DrawComponent]
})
export class IgoDrawModule {}
