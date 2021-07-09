import { AfterViewInit, Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { EventEmitter } from '@angular/core';
import { TransitionCheckState } from '@angular/material/checkbox';

export interface SliderGenerationParams {
  startLevel: number;
  endLevel: number;
}

@Component({
  selector: 'igo-parent-tile-gen-slider',
  templateUrl: './parent-tile-gen-slider.component.html',
  styleUrls: ['./parent-tile-gen-slider.component.scss']
})
export class ParentTileGenSliderComponent implements OnInit, AfterViewInit {
  @Output() onValueChange: EventEmitter<any>= new EventEmitter();
  
  @Input('disabled') disabled: boolean = false;
  @Input('parentLevel') parentLevel: number;

  @ViewChild('depthSlider') slider: MatSlider;

  _sliderValue: number = 0;
  get endLevel() {
    return this._sliderValue + this.parentLevel;
  }

  get value(): SliderGenerationParams {
    return {
      startLevel: this.parentLevel,
      endLevel: this.endLevel
    }
  }

  get depth() {
    return this._sliderValue;
  }

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.slider.value = this._sliderValue;
  }

  onSliderChange() {
    this._sliderValue = this.slider.value;
    this.onValueChange.emit(this.value);
  }
}
