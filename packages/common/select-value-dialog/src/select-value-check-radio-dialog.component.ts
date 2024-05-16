import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';

import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject } from 'rxjs';

import { SelectValueDialogType } from './select-value-dialog.enums';
import { SelectValueData } from './select-value-dialog.interface';

@Component({
  selector: 'igo-select-value-check-radio-dialog',
  templateUrl: './select-value-check-radio-dialog.component.html',
  styleUrls: ['./select-value-check-radio-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    MatCheckboxModule,
    MatRadioModule,
    MatDialogActions,
    MatButtonModule,
    AsyncPipe,
    IgoLanguageModule
  ]
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
