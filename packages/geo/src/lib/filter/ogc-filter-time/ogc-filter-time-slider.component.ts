import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlider, MatSliderModule } from '@angular/material/slider';

import { default as moment } from 'moment';

import { OGCFilterTimeService } from '../shared/ogc-filter-time.service';

@Component({
  selector: 'igo-ogc-filter-time-slider',
  templateUrl: './ogc-filter-time-slider.component.html',
  styleUrls: ['./ogc-filter-time-slider.component.scss'],
  imports: [MatSliderModule, FormsModule, MatButtonModule, MatIconModule],
  providers: [OGCFilterTimeService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OgcFilterTimeSliderComponent implements OnInit {
  ogcFilterTimeService = inject(OGCFilterTimeService);

  readonly currentFilter = input<any>(undefined);
  readonly begin = input<any>(undefined);
  readonly max = input<any>(undefined);
  readonly datasource = input<any>(undefined);
  readonly changeProperty = output<any>();
  readonly slider = viewChild(MatSlider);

  interval;
  sliderValue = signal(1);
  calculatedStep = 0;
  readonly _defaultDisplayFormat: string = 'DD/MM/YYYY HH:mm A';
  readonly _defaultSliderInterval: number = 2000;
  public playIcon = 'play_circle';
  public resetIcon = 'replay';

  get sliderInterval(): number {
    const currentFilter = this.currentFilter();
    return currentFilter.sliderInterval === undefined
      ? this._defaultSliderInterval
      : currentFilter.sliderInterval;
  }

  get displayFormat(): string {
    const currentFilter = this.currentFilter();
    if (currentFilter.sliderOptions?.displayFormat) {
      return currentFilter.sliderOptions.displayFormat;
    }
    if (currentFilter.displayFormat) {
      return currentFilter.displayFormat;
    }
    return this._defaultDisplayFormat;
  }

  get beginMillisecond(): number {
    return this.ogcFilterTimeService.dateToNumber(this.begin());
  }

  get maxMillisecond(): number {
    return this.ogcFilterTimeService.dateToNumber(this.max());
  }

  get stepMillisecond(): number {
    return this.ogcFilterTimeService.stepMillisecond(
      this.datasource(),
      this.currentFilter()
    );
  }

  constructor() {}

  ngOnInit() {
    this.calculateStep();
    this.handleSliderInput({ value: 1 });
  }

  sliderDisplayWith = (value) => {
    let dateTmp = new Date(
      this.beginMillisecond + (value - 1) * this.stepMillisecond
    );

    const currentFilter = this.currentFilter();
    const datasource = this.datasource();
    if (
      this.ogcFilterTimeService.stepIsYearDuration(
        this.ogcFilterTimeService.step(datasource, currentFilter)
      )
    ) {
      const toAdd = moment
        .duration(this.ogcFilterTimeService.step(datasource, currentFilter))
        .years();
      dateTmp = moment(this.beginMillisecond)
        .add((value - 1) * toAdd, 'year')
        .toDate();
    } else if (
      this.ogcFilterTimeService.stepIsMonthDuration(
        this.ogcFilterTimeService.step(datasource, currentFilter)
      )
    ) {
      const toAdd = moment
        .duration(this.ogcFilterTimeService.step(datasource, currentFilter))
        .months();
      dateTmp = moment(this.beginMillisecond)
        .add((value - 1) * toAdd, 'month')
        .toDate();
    }

    return moment(dateTmp).format(this.displayFormat);
  };

  playFilter() {
    if (this.interval) {
      this.stopFilter();
    } else {
      this.playIcon = 'pause_circle';
      this.interval = setInterval(
        () => {
          if (this.sliderValue() < this.calculatedStep) {
            this.handleSliderInput({
              value: this.sliderValue()
            });
            this.sliderValue.update((value) => value + this.sliderInterval);
          } else {
            this.stopFilter();
          }
        },
        this.sliderInterval,
        this
      );
    }
  }

  stopFilter() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = undefined;
    this.playIcon = 'play_circle';
  }

  resetFilter() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = undefined;
    this.playIcon = 'play_circle';
    this.sliderValue.set(1);
  }

  handleSliderInput(matSliderChange) {
    if (matSliderChange) {
      const currentFilter = this.currentFilter();
      const datasource = this.datasource();
      if (
        this.ogcFilterTimeService.stepIsYearDuration(
          this.ogcFilterTimeService.step(datasource, currentFilter)
        )
      ) {
        const toAdd = moment
          .duration(this.ogcFilterTimeService.step(datasource, currentFilter))
          .years();
        const dateBeginTmp = moment(this.beginMillisecond)
          .add((matSliderChange.value - 1) * toAdd, 'year')
          .toDate();
        const dateEndTmp = moment(dateBeginTmp).add(toAdd, 'year').toDate();
        this.changeProperty.emit({
          value: moment(dateBeginTmp).toDate().toISOString(),
          pos: 1,
          refreshFilter: false
        });
        this.changeProperty.emit({
          value: moment(dateEndTmp).toDate().toISOString(),
          pos: 2,
          refreshFilter: true
        });
      } else if (
        this.ogcFilterTimeService.stepIsMonthDuration(
          this.ogcFilterTimeService.step(datasource, currentFilter)
        )
      ) {
        const toAdd = moment
          .duration(this.ogcFilterTimeService.step(datasource, currentFilter))
          .months();
        const dateBeginTmp = moment(this.beginMillisecond)
          .add((matSliderChange.value - 1) * toAdd, 'month')
          .toDate();
        const dateEndTmp = moment(dateBeginTmp).add(toAdd, 'month').toDate();
        this.changeProperty.emit({
          value: moment(dateBeginTmp).startOf('month').toDate().toISOString(),
          pos: 1,
          refreshFilter: false
        });
        this.changeProperty.emit({
          value: moment(dateEndTmp).toDate().toISOString(),
          pos: 2,
          refreshFilter: true
        });
      } else if (
        this.ogcFilterTimeService.stepIsDayDuration(
          this.ogcFilterTimeService.step(datasource, currentFilter)
        ) ||
        this.ogcFilterTimeService.stepIsHourDuration(
          this.ogcFilterTimeService.step(datasource, currentFilter)
        ) ||
        this.ogcFilterTimeService.stepIsMinuteDuration(
          this.ogcFilterTimeService.step(datasource, currentFilter)
        )
      ) {
        const dateTmp = new Date(
          this.beginMillisecond +
            this.stepMillisecond * (matSliderChange.value - 1)
        );
        this.changeProperty.emit({
          value: dateTmp.toISOString(),
          pos: 1,
          refreshFilter: false
        });
        this.changeProperty.emit({
          value: new Date(
            this.ogcFilterTimeService.addStep(
              dateTmp.toISOString(),
              this.stepMillisecond
            )
          ).toISOString(),
          pos: 2,
          refreshFilter: true
        });
      }
    }
  }

  calculateStep() {
    const totalMilliseconds = this.maxMillisecond - this.beginMillisecond;
    const rawSteps = Math.floor(totalMilliseconds / this.stepMillisecond);
    this.calculatedStep =
      Math.max(1, Math.ceil(rawSteps / this.sliderInterval)) + 1;
  }
}
