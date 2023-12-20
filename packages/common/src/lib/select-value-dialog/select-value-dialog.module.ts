import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

import { IgoLanguageModule } from '@igo2/core';

import { IgoFormModule } from '../form/form.module';
import { SelectValueCheckRadioDialogComponent } from './select-value-check-radio-dialog.component';
import { SelectValueDialogService } from './select-value-dialog.service';

@NgModule({
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    MatDialogModule,
    ReactiveFormsModule,
    IgoLanguageModule,
    IgoFormModule,
    SelectValueCheckRadioDialogComponent
  ],
  exports: [SelectValueCheckRadioDialogComponent],
  providers: [SelectValueDialogService]
})
export class IgoSelectValueDialogModule {
  static forRoot(): ModuleWithProviders<IgoSelectValueDialogModule> {
    return {
      ngModule: IgoSelectValueDialogModule,
      providers: []
    };
  }
}
