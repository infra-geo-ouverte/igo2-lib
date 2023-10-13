import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { IgoKeyValueModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { PrintFormComponent } from './print-form/print-form.component';
import { PrintComponent } from './print/print.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    IgoLanguageModule,
    IgoKeyValueModule
  ],
  exports: [PrintComponent, PrintFormComponent],
  declarations: [PrintComponent, PrintFormComponent]
})
export class IgoPrintModule {}
