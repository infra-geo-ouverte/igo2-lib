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

  sliderValue: number = 0;

  protected updateLevels() {
    this._startLevel = this._parentLevel;
    this._endLevel = this._parentLevel + this.sliderValue;
  }

  protected set endLevel(endLevel: number) {
    this._endLevel = endLevel;
    if (endLevel === undefined || Number.isNaN(endLevel)) {
      this.sliderValue = 0;
      return;
    }
    this.sliderValue = endLevel - this.startLevel;
  }

  protected get endLevel(): number {
    return this._endLevel;
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
    this.endLevel = this.parentLevel;
  }

  onSliderChange() {
    this._endLevel = this.parentLevel + this.slider.value;
    this.emitValue();
  }
}
