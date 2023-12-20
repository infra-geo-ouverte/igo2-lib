import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { IgoFormFieldComponent } from '../shared/form-field-component';
import {
  formControlIsRequired,
  getControlErrorMessage
} from '../shared/form.utils';

/**
 * This component renders a textarea field
 */
@IgoFormFieldComponent('textarea')
@Component({
  selector: 'igo-form-field-textarea',
  templateUrl: './form-field-textarea.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatIconModule,
    AsyncPipe,
    TranslateModule
  ]
})
export class FormFieldTextareaComponent implements OnInit {
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
