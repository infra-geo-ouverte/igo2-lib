import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { LanguageService } from '@igo2/core';

import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { CustomHtmlComponent } from '../custom-html/custom-html.component';
import { FormFieldComponent } from '../form/form-field/form-field.component';
import { FormGroupComponent } from '../form/form-group/form-group.component';
import { FormComponent } from '../form/form/form.component';
import {
  Form,
  FormField,
  FormFieldGroup,
  FormFieldInputs
} from '../form/shared/form.interfaces';
import { FormService } from '../form/shared/form.service';
import { FormDialogData } from './form-dialog.interface';

@Component({
  selector: 'igo-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    NgIf,
    FormComponent,
    NgFor,
    FormFieldComponent,
    FormGroupComponent,
    MatDialogActions,
    MatButtonModule,
    CustomHtmlComponent,
    AsyncPipe,
    TranslateModule
  ]
})
export class FormDialogComponent {
  form$ = new BehaviorSubject<Form>(undefined);
  data$ = new BehaviorSubject<{ [key: string]: any }>(undefined);
  constructor(
    public languageService: LanguageService,
    public dialogRef: MatDialogRef<FormDialogComponent>,
    private formService: FormService,
    @Inject(MAT_DIALOG_DATA)
    public data: FormDialogData
  ) {
    this.data.processButtonText =
      this.data.processButtonText ?? 'igo.common.formDialog.processButtonText';
    this.data.cancelButtonText =
      this.data.cancelButtonText ?? 'igo.common.formDialog.cancelButtonText';
    this.data.title = this.data.title ?? 'igo.common.formDialog.title';
    this.data$ = this.data.data$;

    let fields: FormField<FormFieldInputs>[] = [];
    let groups: FormFieldGroup[] = [];
    this.data.formFieldConfigs?.map((config) =>
      fields.push(this.formService.field(config))
    );

    this.data.formGroupsConfigs?.map((formGroupsConfig) => {
      const fields = formGroupsConfig.formFieldConfigs?.map((config) =>
        this.formService.field(config)
      );
      groups.push(
        this.formService.group({ name: formGroupsConfig.name }, fields)
      );
    });
    const form = this.formService.form(fields, groups);

    this.form$.next(form);
  }

  onSubmit(data: { [key: string]: any }) {
    const form = this.form$.getValue();
    if (form.control.valid) {
      this.dialogRef.close(data);
    } else {
      if (form.groups?.length) {
        form.groups.map((group) => {
          Object.keys(group.control.controls).map((k) => {
            group.control.controls[k].markAsTouched();
            group.control.controls[k].updateValueAndValidity();
          });
        });
      } else {
        form.fields.map((f) => {
          f.control.markAsTouched();
          f.control.updateValueAndValidity();
        });
      }
    }
  }
  cancel() {
    this.dialogRef.close();
  }
}
