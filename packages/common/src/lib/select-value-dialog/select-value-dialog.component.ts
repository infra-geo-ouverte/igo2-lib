import { Component, Inject, OnDestroy, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { LanguageService } from '@igo2/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { Form, FormFieldConfig } from '../form/shared/form.interfaces';
import { FormService } from '../form/shared/form.service';
import { SelectValueData } from './select-value-dialog.interface';

@Component({
  selector: 'igo-select-value-dialog',
  templateUrl: './select-value-dialog.component.html',
  styleUrls: ['./select-value-dialog.component.scss']
})
export class SelectValueDialogComponent implements OnDestroy {
  form$ = new BehaviorSubject<Form>(undefined);
  data$ = new BehaviorSubject<{ [key: string]: any }>(undefined);
  public isDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private valueChanges$$: Subscription;
  constructor(
    public languageService: LanguageService,
    public dialogRef: MatDialogRef<SelectValueDialogComponent>,
    private formService: FormService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: SelectValueData
  ) {
    this.data.selectFieldText =
      this.data.selectFieldText ??
      'igo.common.selectValueDialog.selectFieldText';
    this.data.processButtonText =
      this.data.processButtonText ??
      'igo.common.selectValueDialog.processButtonText';
    this.data.cancelButtonText =
      this.data.cancelButtonText ??
      'igo.common.selectValueDialog.cancelButtonText';
    this.data.multiple = this.data.multiple === true ? true : false;
    this.data.title =
      this.data.title ?? 'igo.common.selectValueDialog.multipleTitle';
    if (!this.data.multiple) {
      this.data.title = 'igo.common.selectValueDialog.title';
    }

    const fieldConfigs: FormFieldConfig[] = [
      {
        name: 'choices',
        title: this.languageService.translate.instant(
          this.data.selectFieldText
        ),
        type: 'select',
        options: {
          cols: 2
        },
        inputs: {
          choices: this.data.choices,
          multiple: this.data.multiple
        }
      }
    ];

    const fields = fieldConfigs.map((config) => this.formService.field(config));
    const form = this.formService.form(
      [],
      [this.formService.group({ name: 'info' }, fields)]
    );
    this.valueChanges$$ = form.control.valueChanges.subscribe(() => {
      this.isDisabled$.next(!form.control.valid);
    });

    this.form$.next(form);
  }

  ngOnDestroy() {
    this.valueChanges$$.unsubscribe();
  }

  onSubmit(data: { [key: string]: any }) {
    this.dialogRef.close(data);
  }
  cancel() {
    this.dialogRef.close();
  }
}
