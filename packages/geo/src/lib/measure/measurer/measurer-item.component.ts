import { AsyncPipe, NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
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
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NgFor,
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
  public measure$: BehaviorSubject<number> = new BehaviorSubject(undefined);

  /**
   * Subscription to the measure observable when the auto mode is on
   * @internal
   */
  public measure$$: Subscription;

  /**
   * Measure type
   */
  @Input() measureType: MeasureType;

  /**
   * Measure unit
   */
  @Input() measureUnit: MeasureAreaUnit | MeasureLengthUnit;

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
  private _auto: boolean = false;

  /**
   * Placeholder
   */
  @Input() placeholder: string;

  /**
   * Event emitted when the measure unit changes
   */
  @Output() measureUnitChange = new EventEmitter<
    MeasureAreaUnit | MeasureLengthUnit
  >();

  /**
   * Available measure units for the measure type given
   * @internal
   */
  get measureUnits(): string[] {
    if (this.measureType === MeasureType.Area) {
      return Object.values(MeasureAreaUnit);
    }
    return Object.values(MeasureLengthUnit);
  }

  constructor() {}

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
    this.measureUnit = unit;
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
    let measureUnit = this.measureUnit;
    if (this.measureType === MeasureType.Area) {
      measureUnit = computeBestAreaUnit(measure);
    } else if (this.measureType === MeasureType.Length) {
      measureUnit = computeBestLengthUnit(measure);
    }
    if (measureUnit !== this.measureUnit) {
      this.onMeasureUnitChange(measureUnit);
    }
  }
}
