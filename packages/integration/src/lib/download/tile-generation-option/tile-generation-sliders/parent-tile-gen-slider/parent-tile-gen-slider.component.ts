import { AfterViewInit, Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { EventEmitter } from '@angular/core';
import { TransitionCheckState } from '@angular/material/checkbox';
import { SliderGenerationParams, TileGenerationSliderComponent } from '../tile-generation-slider.component';



@Component({
  selector: 'igo-parent-tile-gen-slider',
  templateUrl: './parent-tile-gen-slider.component.html',
  styleUrls: ['./parent-tile-gen-slider.component.scss']
})
export class ParentTileGenSliderComponent extends TileGenerationSliderComponent implements OnInit, AfterViewInit  {
  // @Output() onValueChange: EventEmitter<any>= new EventEmitter();
  
  // @Input('disabled') disabled: boolean = false;
  // @Input('parentLevel') parentLevel: number;

  @ViewChild('depthSlider') slider: MatSlider;

  _sliderValue: number = 0;
  
  protected set endLevel(endLevel: number) {
    this._sliderValue = endLevel - this.startLevel;
    this.slider.value = this._sliderValue;
  }

  protected get endLevel(): number {
    return this._sliderValue + this.parentLevel;
  }

  protected get startLevel(): number {
    return this.parentLevel;
  }

  get value(): SliderGenerationParams {
    return {
      startLevel: this.startLevel,
      endLevel: this.endLevel
    }
  }

  set value(value: SliderGenerationParams) {
    this.endLevel = value.endLevel;
  }

  get depth() {
    if (Number.isNaN(this._sliderValue)) {
      return 0;
    }
    return this._sliderValue;
  }

  constructor() {
    super()
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  onSliderChange() {
    this._sliderValue = this.slider.value;
    this.emitValue();
  }
}
