import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSlider } from '@angular/material/slider';

export interface SliderGenerationParams {
  startLevel: number;
  parentLevel: number;
  endLevel: number;
}

@Component({
  selector: 'igo-parent-tile-gen-slider',
  templateUrl: './parent-tile-gen-slider.component.html',
  styleUrls: ['./parent-tile-gen-slider.component.scss']
})
export class ParentTileGenSliderComponent implements OnInit, AfterViewInit {
  @Input('onChange') onValueChangeFunction: () => void;
  @Input('disabled') disabled: boolean = false;
  @Input('parentLevel')
  get parentLevel(): number {
    return this.tileGenerationParams.parentLevel;
  }

  set parentLevel(level: number) {
    this.tileGenerationParams.startLevel = level;
    this.tileGenerationParams.parentLevel = level;
  };

  @ViewChild('depthSlider') slider: MatSlider;

  tileGenerationParams: SliderGenerationParams = {startLevel: 0, endLevel: 0, parentLevel: 0};
  
  get endLevel() {
    return this.tileGenerationParams.endLevel;
  }

  set endLevel(level: number) {
    this.tileGenerationParams.endLevel = level;
  }

  constructor() { 
    this.endLevel = 0;
  }

  ngOnInit() {
    console.log('Slider disabled value', this.disabled);
  }

  ngAfterViewInit() {
    this.slider.value = 0;
  }

  onSliderChange() {
    this.onValueChangeFunction();
    this.endLevel = this.slider.value;
    //console.log(this.endLevel);
  }
}
