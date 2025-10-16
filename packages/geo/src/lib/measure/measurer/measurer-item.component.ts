import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  input,
  model,
  output
} from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, Subscription } from 'rxjs';

import {
  MeasureAreaUnit,
  MeasureLengthUnit,
  MeasureType
} from '../shared/measure.enum';
import {
  computeBestAreaUnit,
  computeBestLengthUnit
} from '../shared/measure.utils';
import { MeasureFormatPipe } from './measure-format.pipe';

/**
 * Measurer item
 */
@Component({
  selector: 'igo-measurer-item',
  templateUrl: './measurer-item.component.html',
  styleUrls: ['./measurer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    AsyncPipe,
    IgoLanguageModule,
    MeasureFormatPipe
  ]
})
export class MeasurerItemComponent implements OnDestroy {
  /**
   * Measure observable
   * @internal
   */
  public measure$ = new BehaviorSubject<number>(undefined);

  /**
   * Subscription to the measure observable when the auto mode is on
   * @internal
   */
  public measure$$: Subscription;

  /**
   * Measure type
   */
  readonly measureType = input<MeasureType>(undefined);

  /**
   * Measure unit
   */
  readonly measureUnit = model<MeasureAreaUnit | MeasureLengthUnit>(undefined);
  /**
   * Measure
   */
  @Input()
  set measure(value: number) {
    this.measure$.next(value);
  }
  get measure(): number {
    return this.measure$.value;
  }

  /**
   * Whther measure units should be automatically determined
   */
  @Input()
  set auto(value: boolean) {
    this.toggleAutoUnit(value);
  }
  get auto(): boolean {
    return this._auto;
  }
  private _auto = false;

  /**
   * Placeholder
   */
  readonly placeholder = input<string>(undefined);

  /**
   * Event emitted when the measure unit changes
   */
  readonly measureUnitChange = output<MeasureAreaUnit | MeasureLengthUnit>();

  /**
   * Available measure units for the measure type given
   * @internal
   */
  get measureUnits(): string[] {
    if (this.measureType() === MeasureType.Area) {
      return Object.values(MeasureAreaUnit);
    }
    return Object.values(MeasureLengthUnit);
  }

  /**
   * Toggle the auto unit off
   * @internal
   */
  ngOnDestroy() {
    this.toggleAutoUnit(false);
  }

  /**
   * Set the measure unit
   * @internal
   */
  onMeasureUnitChange(unit: MeasureAreaUnit | MeasureLengthUnit) {
    this.measureUnit.set(unit);
    this.measureUnitChange.emit(unit);
  }

  private toggleAutoUnit(toggle: boolean) {
    if (this.measure$$ !== undefined) {
      this.measure$$.unsubscribe();
    }
    if (toggle === true) {
      this.measure$$ = this.measure$.subscribe((measure: number) => {
        this.computeBestMeasureUnit(measure);
      });
    }
    this._auto = toggle;
  }

  private computeBestMeasureUnit(measure: number) {
    let measureUnit = this.measureUnit();
    const measureType = this.measureType();
    if (measureType === MeasureType.Area) {
      measureUnit = computeBestAreaUnit(measure);
    } else if (measureType === MeasureType.Length) {
      measureUnit = computeBestLengthUnit(measure);
    }
    if (measureUnit !== this.measureUnit()) {
      this.onMeasureUnitChange(measureUnit);
    }
  }
}
