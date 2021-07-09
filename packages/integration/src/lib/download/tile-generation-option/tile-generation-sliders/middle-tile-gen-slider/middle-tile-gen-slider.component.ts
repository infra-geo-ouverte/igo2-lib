import { Options } from '@angular-slider/ngx-slider';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
    }
  }

  constructor() {
    super();
  }
  
  protected get startLevel(): number {
    return this.minValue;
  }
  
  protected get endLevel(): number {
    return this.maxValue;
  }
  
  get value(): SliderGenerationParams {
    return {
      startLevel: this.startLevel,
      endLevel: this.endLevel
    }
  }
  
  ngOnInit() {
  }

  ngAfterViewInit() {
    this.minValue = this.parentLevel;
    this.maxValue = this.parentLevel + 2;
  }

  onSliderChange() {
    this.emitValue();
  }
}
