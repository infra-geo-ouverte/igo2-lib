import {
  Input,
  Component,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import type { UntypedFormControl } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import {
  formControlIsRequired,
  getControlErrorMessage
} from '../shared/form.utils';
import { IgoFormFieldComponent } from '../shared/form-field-component';

/**
 * This component renders a text field
 */
@IgoFormFieldComponent('text')
@Component({
  selector: 'igo-form-field-text',
  templateUrl: './form-field-text.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldTextComponent implements OnInit {

  disabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
