import { Component, Inject, OnInit, Optional } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';

import { LanguageService } from '@igo2/core';

import { BehaviorSubject } from 'rxjs';

import { SelectValueData } from './select-value-dialog.interface';

@Component({
  selector: 'igo-select-value-dialog',
  templateUrl: './select-value-dialog.component.html',
  styleUrls: ['./select-value-dialog.component.scss']
})
export class SelectValueDialogComponent implements OnInit {
  public formGroup: UntypedFormGroup;
  public isDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    private formBuilder: UntypedFormBuilder,
    public languageService: LanguageService,
    public dialogRef: MatDialogRef<SelectValueDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: SelectValueData
  ) {
    this.formGroup = this.formBuilder.group(this.getFg());
    this.data.title = this.data.title ?? 'igo.common.selectValueDialog.title';
    this.data.processButtonText =
      this.data.processButtonText ??
      'igo.common.selectValueDialog.processButtonText';
    this.data.cancelButtonText =
      this.data.cancelButtonText ??
      'igo.common.selectValueDialog.cancelButtonText';
    this.data.multiple = this.data.multiple ?? true;
  }

  ngOnInit() {
    this.formGroup.valueChanges.subscribe(() => this.canProcess());
  }

  getFg() {
    const a = {};
    this.data.choices.map((l) => (a[l.id] = false));
    return a;
  }

  canProcess() {
    const choices = this.data.choices.map((l) => l.id);
    const selectedIds = [];
    choices.map((l) =>
      this.formGroup.value[l] ? selectedIds.push(l) : undefined
    );
    selectedIds.length
      ? this.isDisabled$.next(false)
      : this.isDisabled$.next(true);
  }

  save() {
    const choices = this.data.choices.map((l) => l.id);

    const selectedChoices = [];
    choices.map((l) =>
      this.formGroup.value[l] ? selectedChoices.push(l) : undefined
    );
    this.dialogRef.close(selectedChoices);
  }

  cancel() {
    this.dialogRef.close();
  }

  onChange(e: MatRadioChange) {
    const choices = {};
    this.data.choices.map((l) => (choices[l.id] = false));
    choices[e.value] = true;
    this.formGroup.setValue(choices);
  }
}
