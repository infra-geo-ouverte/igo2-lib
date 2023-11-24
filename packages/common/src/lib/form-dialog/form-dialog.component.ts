import { Component, Inject, OnDestroy, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { LanguageService } from '@igo2/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { Form } from '../form/shared/form.interfaces';
import { FormService } from '../form/shared/form.service';
import { FormDialogData } from './form-dialog.interface';

@Component({
  selector: 'igo-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss']
})
export class FormDialogComponent implements OnDestroy {
  form$ = new BehaviorSubject<Form>(undefined);
  data$ = new BehaviorSubject<{ [key: string]: any }>(undefined);
  public isDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private valueChanges$$: Subscription;
  constructor(
    public languageService: LanguageService,
    public dialogRef: MatDialogRef<FormDialogComponent>,
    private formService: FormService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: FormDialogData
  ) {
    this.data.processButtonText =
      this.data.processButtonText ?? 'igo.common.formDialog.processButtonText';
    this.data.cancelButtonText =
      this.data.cancelButtonText ?? 'igo.common.formDialog.cancelButtonText';
    this.data.title = this.data.title ?? 'igo.common.formDialog.title';

    const fields = this.data.formFieldConfig.map((config) =>
      this.formService.field(config)
    );
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
