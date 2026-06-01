import { Component, Input, OnInit, input, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { TimeFrame, resolveDate } from '@igo2/utils';

import { combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'igo-timepicker',
  templateUrl: './timepicker.component.html',
  styleUrls: ['./timepicker.component.scss'],
  imports: [
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule
  ]
})
export class TimepickerComponent implements OnInit {
  readonly value = input<Date | TimeFrame>();
  readonly hourInputLabel = input<string>('Hour');
  readonly minuteInputLabel = input<string>('Minute');

  readonly minHour = input<number>();
  readonly maxHour = input<number>();

  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    this.setDisabledState();
  }
  get disabled(): boolean {
    return this._disabled;
  }
  private _disabled = false;

  /** interval in minutes*/
  readonly interval = input<number>(1);
  readonly valueChange = output<{
    hour: number;
    minute: number;
  }>();

  hourFormControl!: FormControl<number>;
  minuteFormControl!: FormControl<number>;

  get hours(): number[] {
    const step = this.interval() >= 60 ? this.interval() / 60 : 1;
    const fullHours = Array.from(
      { length: Math.ceil(24 / step) },
      (_, i) => i * step
    );

    return fullHours.filter((hour) => {
      const minHour = this.minHour();
      if (minHour !== undefined && hour < minHour) return false;
      const maxHour = this.maxHour();
      if (maxHour !== undefined && hour > maxHour) return false;
      return true;
    });
  }

  get minutes(): number[] {
    const minuteStep = this.interval() < 60 ? this.interval() : 0;
    return minuteStep > 0
      ? Array.from(
          { length: Math.ceil(60 / minuteStep) },
          (_, i) => i * minuteStep
        )
      : [0];
  }

  ngOnInit(): void {
    const date = resolveDate(this.value() ?? new Date())!;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    this.hourFormControl = new FormControl(hours, {
      nonNullable: true
    });
    this.minuteFormControl = new FormControl(minutes, {
      nonNullable: true
    });
    this.setDisabledState();

    combineLatest([
      this.hourFormControl.valueChanges.pipe(startWith(hours)),
      this.minuteFormControl.valueChanges.pipe(startWith(minutes))
    ]).subscribe(([hour, minute]) => this.valueChange.emit({ hour, minute }));
  }

  reset(value: Date | TimeFrame): void {
    const date = resolveDate(value)!;
    this.hourFormControl.setValue(date.getHours(), { emitEvent: false });
    this.minuteFormControl.setValue(date.getMinutes(), { emitEvent: false });
  }

  clear(): void {
    this.hourFormControl.setValue(0, { emitEvent: false });
    this.minuteFormControl.setValue(0, { emitEvent: false });
  }

  private setDisabledState(): void {
    if (!this.hourFormControl || !this.minuteFormControl) return;
    this.toggleDisabled(this.hourFormControl, this.disabled);
    this.toggleDisabled(this.minuteFormControl, this.disabled);
  }

  private toggleDisabled(control: FormControl, disabled: boolean): void {
    disabled
      ? control.disable({ emitEvent: false })
      : control.enable({ emitEvent: false });
  }
}
