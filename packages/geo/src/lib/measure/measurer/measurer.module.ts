import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoEntityTableModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { MeasureFormatPipe } from './measure-format.pipe';
import { MeasurerDialogComponent } from './measurer-dialog.component';
import { MeasurerItemComponent } from './measurer-item.component';
import { MeasurerComponent } from './measurer.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    IgoLanguageModule,
    IgoEntityTableModule
  ],
  declarations: [
    MeasureFormatPipe,
    MeasurerItemComponent,
    MeasurerComponent,
    MeasurerDialogComponent
  ],
  exports: [MeasureFormatPipe, MeasurerComponent]
})
export class IgoMeasurerModule {}
