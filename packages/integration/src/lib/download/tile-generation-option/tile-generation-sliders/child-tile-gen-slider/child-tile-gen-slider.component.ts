import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { SliderGenerationParams, TileGenerationSliderComponent } from '../tile-generation-slider.component';

@Component({
  selector: 'igo-child-tile-gen-slider',
  templateUrl: './child-tile-gen-slider.component.html',
  styleUrls: ['./child-tile-gen-slider.component.scss']
})
export class ChildTileGenSliderComponent extends TileGenerationSliderComponent implements OnInit, AfterViewInit {
  @ViewChild('heightSlider') slider: MatSlider;

  constructor() {
    super();
  }

  private _sliderValue: number = 0;

  protected set startLevel(startLevel: number) {
    this._sliderValue = this.parentLevel - startLevel;
    this.slider.value = this._sliderValue;
  }

  protected get startLevel() {
    return this.parentLevel - this.slider.value;
  }

  protected get endLevel() {
    return this.parentLevel;
  }

  protected updateLevels() {
    this._endLevel = this._parentLevel;
    this._startLevel = this._parentLevel - this._sliderValue;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.startLevel = this.parentLevel;
  }

  get value(): SliderGenerationParams {
    return {
      startLevel: this.startLevel,
      endLevel: this.endLevel
    };
  }

  set value(value: SliderGenerationParams) {
    this.startLevel = value.startLevel;
  }

  onSliderChange() {
    this._sliderValue = this.slider.value;
    this.emitValue();
  }

  get height(): number {
    if (Number.isNaN(this._sliderValue)) {
      return 0;
    }
    return this._sliderValue;
  }
}
