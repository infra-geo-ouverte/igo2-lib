import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { IgoLanguageModule } from '@igo2/core';
import { IgoKeyValueModule } from '@igo2/common';

import { PrintComponent } from './print/print.component';
import { PrintFormComponent } from './print-form/print-form.component';

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
