import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
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
  standalone: true,
  imports: [MatSliderModule, FormsModule, MatButtonModule, MatIconModule],
  providers: [OGCFilterTimeService]
})
export class OgcFilterTimeSliderComponent implements OnInit {
  @Input() currentFilter: any;
  @Input() begin: any;
  @Input() max: any;
  @Input() datasource: any;
  @Output() changeProperty: EventEmitter<{
    value: any;
    pos: number;
    refreshFilter: boolean;
  }> = new EventEmitter<any>();
  @ViewChild(MatSlider) slider: MatSlider;

  interval;
  sliderValue = 1;
  calculatedStep = 0;
  readonly _defaultDisplayFormat: string = 'DD/MM/YYYY HH:mm A';
  readonly _defaultSliderInterval: number = 2000;
  public playIcon = 'play_circle';
  public resetIcon = 'replay';

  get sliderInterval(): number {
    return this.currentFilter.sliderInterval === undefined
      ? this._defaultSliderInterval
      : this.currentFilter.sliderInterval;
  }

  get displayFormat(): string {
    if (this.currentFilter.sliderOptions?.displayFormat) {
      return this.currentFilter.sliderOptions.displayFormat;
    }
    if (this.currentFilter.displayFormat) {
      return this.currentFilter.displayFormat;
    }
    return this._defaultDisplayFormat;
  }

  get beginMillisecond(): number {
    return this.ogcFilterTimeService.dateToNumber(this.begin);
  }

  get maxMillisecond(): number {
    return this.ogcFilterTimeService.dateToNumber(this.max);
  }

  get stepMillisecond(): number {
    return this.ogcFilterTimeService.stepMillisecond(
      this.datasource,
      this.currentFilter
    );
  }

  constructor(public ogcFilterTimeService: OGCFilterTimeService) {
    this.sliderDisplayWith = this.sliderDisplayWith.bind(this);
  }

  ngOnInit() {
    this.calculateStep();
    this.handleSliderInput({ value: 1 });
  }

  sliderDisplayWith(value) {
    let dateTmp = new Date(
      this.beginMillisecond + (value - 1) * this.stepMillisecond
    );

    if (
      this.ogcFilterTimeService.stepIsYearDuration(
        this.ogcFilterTimeService.step(this.datasource, this.currentFilter)
      )
    ) {
      const toAdd = moment
        .duration(
          this.ogcFilterTimeService.step(this.datasource, this.currentFilter)
        )
        .years();
      dateTmp = moment(this.beginMillisecond)
        .add((value - 1) * toAdd, 'year')
        .toDate();
    } else if (
      this.ogcFilterTimeService.stepIsMonthDuration(
        this.ogcFilterTimeService.step(this.datasource, this.currentFilter)
      )
    ) {
      const toAdd = moment
        .duration(
          this.ogcFilterTimeService.step(this.datasource, this.currentFilter)
        )
        .months();
      dateTmp = moment(this.beginMillisecond)
        .add((value - 1) * toAdd, 'month')
        .toDate();
    }

    return moment(dateTmp).format(this.displayFormat);
  }

  playFilter() {
    if (this.interval) {
      this.stopFilter();
    } else {
      this.playIcon = 'pause_circle';
      this.interval = setInterval(
        () => {
          if (this.slider.step < this.calculatedStep) {
            const _increment = '_increment';
            const _emitInputEvent = '_emitInputEvent';
            this.slider[_increment](1);
            this.slider[_emitInputEvent]();
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
    this.slider.step = 1;
    const _emitInputEvent = '_emitInputEvent';
    this.slider[_emitInputEvent]();
  }

  handleSliderInput(matSliderChange) {
    if (matSliderChange) {
      if (
        this.ogcFilterTimeService.stepIsYearDuration(
          this.ogcFilterTimeService.step(this.datasource, this.currentFilter)
        )
      ) {
        const toAdd = moment
          .duration(
            this.ogcFilterTimeService.step(this.datasource, this.currentFilter)
          )
          .years();
        const dateBeginTmp = moment(this.beginMillisecond)
          .add((matSliderChange.value - 1) * toAdd, 'year')
          .toDate();
        const dateEndTmp = moment(dateBeginTmp).add(toAdd, 'year').toDate();
        this.changeProperty.next({
          value: moment(dateBeginTmp).toDate().toISOString(),
          pos: 1,
          refreshFilter: false
        });
        this.changeProperty.next({
          value: moment(dateEndTmp).toDate().toISOString(),
          pos: 2,
          refreshFilter: true
        });
      } else if (
        this.ogcFilterTimeService.stepIsMonthDuration(
          this.ogcFilterTimeService.step(this.datasource, this.currentFilter)
        )
      ) {
        const toAdd = moment
          .duration(
            this.ogcFilterTimeService.step(this.datasource, this.currentFilter)
          )
          .months();
        const dateBeginTmp = moment(this.beginMillisecond)
          .add((matSliderChange.value - 1) * toAdd, 'month')
          .toDate();
        const dateEndTmp = moment(dateBeginTmp).add(toAdd, 'month').toDate();
        this.changeProperty.next({
          value: moment(dateBeginTmp).startOf('month').toDate().toISOString(),
          pos: 1,
          refreshFilter: false
        });
        this.changeProperty.next({
          value: moment(dateEndTmp).toDate().toISOString(),
          pos: 2,
          refreshFilter: true
        });
      } else if (
        this.ogcFilterTimeService.stepIsDayDuration(
          this.ogcFilterTimeService.step(this.datasource, this.currentFilter)
        ) ||
        this.ogcFilterTimeService.stepIsHourDuration(
          this.ogcFilterTimeService.step(this.datasource, this.currentFilter)
        ) ||
        this.ogcFilterTimeService.stepIsMinuteDuration(
          this.ogcFilterTimeService.step(this.datasource, this.currentFilter)
        )
      ) {
        const dateTmp = new Date(
          this.beginMillisecond +
            this.stepMillisecond * (matSliderChange.value - 1)
        );
        this.changeProperty.next({
          value: dateTmp.toISOString(),
          pos: 1,
          refreshFilter: false
        });
        this.changeProperty.next({
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
    for (
      let i = 1;
      this.maxMillisecond -
        (this.beginMillisecond + i * this.stepMillisecond) >=
      -1;
      i++
    ) {
      this.calculatedStep = i;
    }
  }
}
