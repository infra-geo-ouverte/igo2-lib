import {
  Input,
  Component,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, Observable, of } from 'rxjs';

import { formControlIsRequired, getControlErrorMessage } from '../shared/form.utils';
import { FormFieldSelectChoice } from '../shared/form.interfaces';
import { FormFieldComponent } from '../shared/form-field-component';

/**
 * This component renders a select field
 */
@FormFieldComponent('select')
@Component({
  selector: 'igo-form-field-select',
  templateUrl: './form-field-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldSelectComponent implements OnInit {

  choices$: Observable<FormFieldSelectChoice[]>;

  disabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * The field's form control
   */
  @Input() formControl: FormControl;

  /**
   * Field placeholder
   */
  @Input() placeholder: string;

  /**
   * Select input choices
   */
  @Input()
  set choices(value: Observable<FormFieldSelectChoice[]> | FormFieldSelectChoice[]) {
    if (value instanceof Observable) {
      this.choices$ = value;
    } else {
      this.choices$ = of(value);
    }
  }

  /**
   * Field placeholder
   */
  @Input() errors: {[key: string]: string};

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
