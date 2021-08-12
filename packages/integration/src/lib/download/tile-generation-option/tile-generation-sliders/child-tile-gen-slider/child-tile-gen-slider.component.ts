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

  sliderValue: number = 0;

  protected updateLevels() {
    this._endLevel = this._parentLevel;
    this._startLevel = this._parentLevel - this.sliderValue;
  }

  protected set startLevel(startLevel: number) {
    this._startLevel = startLevel;
    if (startLevel === undefined || Number.isNaN(startLevel)) {
      this.sliderValue = 0;
      return;
    }
    this.sliderValue = this._parentLevel - startLevel;
  }

  protected get startLevel() {
    return this._startLevel;
  }

  protected get endLevel() {
    return this.parentLevel;
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
    this._startLevel = this.parentLevel - this.slider.value;
    this.emitValue();
  }

  get height(): number {
    if (Number.isNaN(this.sliderValue)) {
      return 0;
    }
    return this.sliderValue;
  }
}
