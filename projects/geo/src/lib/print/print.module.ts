import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatIconModule,
  MatButtonModule,
  MatSelectModule,
  MatOptionModule,
  MatInputModule,
  MatFormFieldModule,
  MatSlideToggleModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoKeyValueModule } from '@igo2/common';

import { PrintComponent } from './print/print.component';
import { PrintBindingDirective } from './print/print-binding.directive';
import { PrintFormComponent } from './print-form/print-form.component';
import { PrintService } from './shared/print.service';

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
  exports: [PrintComponent, PrintBindingDirective, PrintFormComponent],
  declarations: [PrintComponent, PrintBindingDirective, PrintFormComponent]
})
export class IgoPrintModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoPrintModule
    };
  }
}
