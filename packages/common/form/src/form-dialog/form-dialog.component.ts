import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { CustomHtmlComponent } from '@igo2/common/custom-html';
import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject } from 'rxjs';

import { FormComponent } from '../form';
import { FormFieldComponent } from '../form-field';
import { FormGroupComponent } from '../form-group';
import { FormService } from '../shared';
import { buildFormFromConfig, markFormAsTouched } from '../shared/form.utils';
import { FormDialogData } from './form-dialog.interface';

@Component({
  selector: 'igo-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    FormComponent,
    FormFieldComponent,
    FormGroupComponent,
    MatDialogActions,
    MatButtonModule,
    CustomHtmlComponent,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class FormDialogComponent {
  languageService = inject(LanguageService);
  dialogRef = inject<MatDialogRef<FormDialogComponent>>(MatDialogRef);
  private formService = inject(FormService);
  data = inject<FormDialogData>(MAT_DIALOG_DATA);

  form$ = new BehaviorSubject<
    ReturnType<typeof buildFormFromConfig> | undefined
  >(undefined);
  data$: BehaviorSubject<Record<string, unknown>>;
  constructor() {
    this.data.processButtonText =
      this.data.processButtonText ?? 'igo.common.formDialog.processButtonText';
    this.data.cancelButtonText =
      this.data.cancelButtonText ?? 'igo.common.formDialog.cancelButtonText';
    this.data.title = this.data.title ?? 'igo.common.formDialog.title';
    this.data$ = this.data.data$ ?? new BehaviorSubject({});

    const form = buildFormFromConfig(this.formService, this.data);

    this.form$.next(form);
  }

  onSubmit(data: Record<string, unknown>) {
    const form = this.form$.getValue();
    if (!form) return;
    if (form.control.valid) {
      this.dialogRef.close(data);
    } else {
      markFormAsTouched(form);
    }
  }
  cancel() {
    this.dialogRef.close();
  }
}
