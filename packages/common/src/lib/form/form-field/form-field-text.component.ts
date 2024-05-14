import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject } from 'rxjs';

import { IgoFormFieldComponent } from '../shared/form-field-component';
import {
  formControlIsRequired,
  getControlErrorMessage
} from '../shared/form.utils';

/**
 * This component renders a text field
 */
@IgoFormFieldComponent('text')
@Component({
  selector: 'igo-form-field-text',
  templateUrl: './form-field-text.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatIconModule,
    MatButtonModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class FormFieldTextComponent implements OnInit {
  disabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  hide: boolean = true;
  private lastTimeoutRequest;

  /**
   * The field's form control
   */
  @Input() formControl: UntypedFormControl;

  /**
   * Field placeholder
   */
  @Input() placeholder: string;

  /**
   * if the input is a password
   */
  @Input() isPassword: boolean;

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

  constructor(private cdRef: ChangeDetectorRef) {}

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

  togglePassword() {
    this.hide = !this.hide;
    this.delayedHide();
  }
  delayedHide(delayMS: number = 10000) {
    if (this.isPassword && !this.hide) {
      if (this.lastTimeoutRequest) {
        clearTimeout(this.lastTimeoutRequest);
      }
      this.lastTimeoutRequest = setTimeout(() => {
        this.hide = true;
        this.cdRef.detectChanges();
      }, delayMS);
    }
  }
}
