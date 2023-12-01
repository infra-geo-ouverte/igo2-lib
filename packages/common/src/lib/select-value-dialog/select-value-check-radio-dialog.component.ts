import { Component, Inject, OnInit, Optional } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';

import { LanguageService } from '@igo2/core';

import { BehaviorSubject } from 'rxjs';

import { SelectValueDialogType } from './select-value-dialog.enums';
import { SelectValueData } from './select-value-dialog.interface';

@Component({
  selector: 'igo-select-value-check-radio-dialog',
  templateUrl: './select-value-check-radio-dialog.component.html',
  styleUrls: ['./select-value-check-radio-dialog.component.scss']
})
export class SelectValueCheckRadioDialogComponent implements OnInit {
  public formGroup: UntypedFormGroup;
  public isDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    private formBuilder: UntypedFormBuilder,
    public languageService: LanguageService,
    public dialogRef: MatDialogRef<SelectValueCheckRadioDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: SelectValueData
  ) {
    this.formGroup = this.formBuilder.group(this.getFg());
    this.data.selectFieldText =
      this.data.selectFieldText ??
      'igo.common.selectValueDialog.selectFieldText';
    this.data.processButtonText =
      this.data.processButtonText ??
      'igo.common.selectValueDialog.processButtonText';
    this.data.cancelButtonText =
      this.data.cancelButtonText ??
      'igo.common.selectValueDialog.cancelButtonText';
    this.data.title =
      this.data.title ?? 'igo.common.selectValueDialog.multipleTitle';
    if (this.data.type === SelectValueDialogType.Radio) {
      this.data.title = 'igo.common.selectValueDialog.title';
    }
  }

  ngOnInit() {
    this.formGroup.valueChanges.subscribe(() => this.canProcess());
  }

  getFg() {
    const a = {};
    this.data.choices.map((l) => (a[l.value] = false));
    return a;
  }

  canProcess() {
    const choices = this.data.choices.map((l) => l.value);
    const selectedIds = [];
    choices.map((l) =>
      this.formGroup.value[l] ? selectedIds.push(l) : undefined
    );
    selectedIds.length
      ? this.isDisabled$.next(false)
      : this.isDisabled$.next(true);
  }

  save() {
    const choices = this.data.choices.map((l) => l.value);

    const selectedChoices = [];
    choices.map((l) =>
      this.formGroup.value[l] ? selectedChoices.push(l) : undefined
    );
    this.dialogRef.close({ choices: selectedChoices });
  }

  cancel() {
    this.dialogRef.close();
  }

  onChange(e: MatRadioChange) {
    const choices = {};
    this.data.choices.map((l) => (choices[l.value] = false));
    choices[e.value] = true;
    this.formGroup.setValue(choices);
  }
}
