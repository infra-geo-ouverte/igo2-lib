import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import type { UntypedFormControl } from '@angular/forms';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldSelectComponent implements OnInit {
  readonly disabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
  readonly choices$: BehaviorSubject<FormFieldSelectChoice[]> =
    new BehaviorSubject([]);

  /**
   * If the select allow multiple selections
   */
  @Input() multiple: boolean = false;

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
  @Input() errors: { [key: string]: string };

  /**
   * Wheter a disable switch should be available
   */
  @Input() disableSwitch: boolean = false;

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
