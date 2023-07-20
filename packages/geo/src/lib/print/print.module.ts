import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';

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
