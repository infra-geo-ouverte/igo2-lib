import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { SliderGenerationParams, TileGenerationSliderComponent } from '../tile-generation-slider.component';



@Component({
  selector: 'igo-parent-tile-gen-slider',
  templateUrl: './parent-tile-gen-slider.component.html',
  styleUrls: ['./parent-tile-gen-slider.component.scss']
})
export class ParentTileGenSliderComponent extends TileGenerationSliderComponent implements OnInit, AfterViewInit  {
  @ViewChild('depthSlider') slider: MatSlider;

  _sliderValue: number = 0;

  protected updateLevels() {
    this._startLevel = this._parentLevel;
    this._endLevel = this._parentLevel + this._sliderValue;
  }

  protected set endLevel(endLevel: number) {
    this._endLevel = endLevel;
    this._sliderValue = endLevel - this.startLevel;
    this.slider.value = this._sliderValue;
  }

  protected get endLevel(): number {
    return this._endLevel;
    // return this.slider.value + this.parentLevel;
  }


  protected get startLevel(): number {
    return this.parentLevel;
  }

  get value(): SliderGenerationParams {
    return {
      startLevel: this.startLevel,
      endLevel: this.endLevel
    };
  }

  set value(value: SliderGenerationParams) {
    this.endLevel = value.endLevel;
  }

  get depth() {
    if (!this.slider) {
      return 0;
    }
    return this.slider.value;
  }

  constructor() {
    super();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  onSliderChange() {
    this._sliderValue = this.slider.value;
    this._endLevel = this.parentLevel + this.slider.value;
    this.emitValue();
  }
}
