import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject } from 'rxjs';

import { IgoFormFieldComponent } from '../shared/form-field-component';
import { FormFieldSelectChoice } from '../shared/form.interfaces';
import {
  formControlIsRequired,
  getControlErrorMessage
} from '../shared/form.utils';

/**
 * This component renders a select field
 */
@IgoFormFieldComponent('select')
@Component({
  selector: 'igo-form-field-select',
  templateUrl: './form-field-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatIconModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class FormFieldSelectComponent implements OnInit {
  readonly disabled$ = new BehaviorSubject<boolean>(false);

  /**
   * Select input choices
   */
  @Input()
  set choices(value: FormFieldSelectChoice[]) {
    this.choices$.next(value);
  }
  get choices(): FormFieldSelectChoice[] {
    return this.choices$.value;
  }
  readonly choices$ = new BehaviorSubject<FormFieldSelectChoice[]>([]);

  /**
   * If the select allow multiple selections
   */
  @Input() multiple = false;

  /**
   * The field's form control
   */
  @Input() formControl: UntypedFormControl;

  /**
   * Field placeholder
   */
  @Input() placeholder: string;

  /**
   * Field placeholder
   */
  @Input() errors: Record<string, string>;

  /**
   * Wheter a disable switch should be available
   */
  @Input() disableSwitch = false;

  /**
   * Whether the field is required
   */
  get required(): boolean {
    return formControlIsRequired(this.formControl);
  }

  ngOnInit() {
    this.disabled$.next(this.formControl.disabled);
  }

  /**
   * Get error message
   */
  getErrorMessage(): string {
    return getControlErrorMessage(this.formControl, this.errors);
  }

  onDisableSwitchClick() {
    this.toggleDisabled();
  }

  private toggleDisabled() {
    const disabled = !this.disabled$.value;
    if (disabled === true) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
    this.disabled$.next(disabled);
  }
}
