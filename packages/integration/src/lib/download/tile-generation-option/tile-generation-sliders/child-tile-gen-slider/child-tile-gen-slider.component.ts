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

  get startLevel() {
    return this.parentLevel - this._sliderValue;
  }

  get endLevel() {
    return this.parentLevel;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.slider.value = this._sliderValue;
  }

  get value(): SliderGenerationParams {
    return {
      startLevel: this.startLevel,
      endLevel: this.endLevel
    }
  }

  onSliderChange() {
    this._sliderValue = this.slider.value;
    this.emitValue();
  }

  get height(): number {
    return this._sliderValue;
  }
}
