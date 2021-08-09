import { Options } from '@angular-slider/ngx-slider';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SliderGenerationParams, TileGenerationSliderComponent } from '../tile-generation-slider.component';

@Component({
  selector: 'igo-middle-tile-gen-slider',
  templateUrl: './middle-tile-gen-slider.component.html',
  styleUrls: ['./middle-tile-gen-slider.component.scss']
})
export class MiddleTileGenSliderComponent extends TileGenerationSliderComponent implements OnInit, AfterViewInit {
  // minValue: number = this.parentLevel;
  // maxValue: number = this.parentLevel + 2;
  minValue: number = 6;
  maxValue: number = 8;

  get sliderOptions(): Options {
    return {
      floor: 2,
      ceil: 17,
      disabled: this.disabled
    };
  }

  constructor() {
    super();
  }

  protected set startLevel(startLevel: number) {
    this.minValue = startLevel;
  }

  protected get startLevel(): number {
    return this.minValue;
  }

  protected set endLevel(endLevel: number) {
    this.maxValue = endLevel;
  }

  protected get endLevel(): number {
    return this.maxValue;
  }

  get value(): SliderGenerationParams {
    return {
      startLevel: this.startLevel,
      endLevel: this.endLevel
    };
  }

  set value(value: SliderGenerationParams) {
    this.startLevel = value.startLevel;
    this.endLevel = value.endLevel;
  }

  protected updateLevels() {
    this._startLevel = this._parentLevel;
    this._endLevel = this._parentLevel + 2;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.minValue = this.parentLevel;
    this.maxValue = this.parentLevel + 2;
  }

  onHighValueChange(value: number) {
    this.maxValue = value;
    this.emitValue();
  }

  onLowValueChange(value: number) {
    this.minValue = value;
    this.emitValue();
  }
}
