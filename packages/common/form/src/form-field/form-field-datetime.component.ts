import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  input,
  signal
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';

import { IgoLanguageModule } from '@igo2/core/language';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IgoFormFieldComponent } from '../shared/form-field-component';
import {
  formControlIsRequired,
  getControlErrorMessage
} from '../shared/form.utils';

@IgoFormFieldComponent('datetime')
@Component({
  selector: 'igo-form-field-datetime',
  templateUrl: './form-field-datetime.component.html',
  styleUrl: './form-field-datetime.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    IgoLanguageModule
  ],
  providers: [provideNativeDateAdapter()]
})
export class FormFieldDatetimeComponent implements OnInit, OnDestroy {
  readonly disabled = signal(false);

  readonly dateTimeGroup = new FormGroup({
    date: new FormControl<Date | null>(null),
    time: new FormControl<Date | null>(null)
  });

  get dateControl(): FormControl<Date | null> {
    return this.dateTimeGroup.controls.date;
  }

  get timeControl(): FormControl<Date | null> {
    return this.dateTimeGroup.controls.time;
  }

  private destroy$ = new Subject<void>();
  private syncingExternalToInternal = false;
  private syncingInternalToExternal = false;

  /**
   * The field's form control
   */
  readonly formControl = input.required<UntypedFormControl>();

  /**
   * Field showLabel
   */
  readonly showLabel = input<boolean>(false);

  /**
   * Field placeholder used for date input
   */
  readonly placeholder = input<string>();

  /**
   * Placeholder used for time input
   */
  readonly timePlaceholder = input<string>();

  /**
   * Minimum selectable date
   */
  readonly minDate = input<Date>();

  /**
   * Maximum selectable date
   */
  readonly maxDate = input<Date>();

  /**
   * Minimum selectable time
   */
  readonly minTime = input<Date | string | null>(null);

  /**
   * Maximum selectable time
   */
  readonly maxTime = input<Date | string | null>(null);

  /**
   * Optional explicit options rendered in the timepicker panel.
   */
  readonly options = input<readonly { value: Date; label: string }[] | null>(
    null
  );

  /**
   * Time option interval for the panel.
   */
  readonly interval = input<number | string | null>(null);

  /**
   * Whether clicking the input should open the timepicker.
   */
  readonly openOnClick = input<boolean>(true);

  /**
   * Whether a disable switch should be available
   */
  readonly disableSwitch = input(false);

  /**
   * Error messages mapping
   */
  readonly errors = input<Record<string, string>>();

  /**
   * Whether the field is required
   */
  get required(): boolean {
    return formControlIsRequired(this.formControl());
  }

  ngOnInit(): void {
    this.disabled.set(this.formControl().disabled);

    this.syncInternalFromExternal(this.formControl().value);

    this.formControl()
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (this.syncingInternalToExternal) {
          return;
        }

        this.syncInternalFromExternal(value);
      });

    this.formControl()
      .statusChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const isDisabled = this.formControl().disabled;
        this.disabled.set(isDisabled);

        if (isDisabled) {
          this.dateTimeGroup.disable({ emitEvent: false });
        } else {
          this.dateTimeGroup.enable({ emitEvent: false });
          this.updateTimeControlState();
        }
      });

    this.dateTimeGroup.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateTimeControlState();
        this.pushInternalToExternal();
      });

    if (this.formControl().disabled) {
      this.dateTimeGroup.disable({ emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getErrorMessage(): string {
    return getControlErrorMessage(this.formControl(), this.errors() || {});
  }

  clearDate(): void {
    this.dateControl.setValue(null);
  }

  clearTime(): void {
    this.timeControl.setValue(null);
  }

  onDisableSwitchClick() {
    const disabled = !this.disabled();
    if (disabled) {
      this.formControl().disable();
    } else {
      this.formControl().enable();
    }
    this.disabled.set(disabled);
  }

  private syncInternalFromExternal(value: unknown): void {
    const externalDate = this.toDateValue(value);

    this.syncingExternalToInternal = true;
    this.dateTimeGroup.patchValue(
      {
        date: externalDate ? new Date(externalDate) : null,
        time: externalDate ? new Date(externalDate) : null
      },
      { emitEvent: false }
    );
    this.syncingExternalToInternal = false;

    this.updateTimeControlState();
  }

  private pushInternalToExternal(): void {
    if (this.syncingExternalToInternal) {
      return;
    }

    const { date: datePart, time: timeValue } =
      this.dateTimeGroup.getRawValue();
    if (!datePart) {
      if (this.formControl().value !== null) {
        this.syncingInternalToExternal = true;
        this.formControl().setValue(null);
        this.syncingInternalToExternal = false;
      }
      return;
    }

    const sourceTime = timeValue;

    const next = new Date(datePart);
    next.setHours(
      sourceTime?.getHours() ?? 0,
      sourceTime?.getMinutes() ?? 0,
      sourceTime?.getSeconds() ?? 0,
      0
    );

    this.syncingInternalToExternal = true;
    this.formControl().setValue(next);
    this.syncingInternalToExternal = false;
  }

  private updateTimeControlState(): void {
    const hasDate = !!this.dateControl.value;
    if (!hasDate && this.timeControl.enabled) {
      this.timeControl.disable({ emitEvent: false });
    } else if (hasDate && this.timeControl.disabled && !this.disabled()) {
      this.timeControl.enable({ emitEvent: false });
    }
  }

  private toDateValue(value: unknown): Date | null {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
  }
}
