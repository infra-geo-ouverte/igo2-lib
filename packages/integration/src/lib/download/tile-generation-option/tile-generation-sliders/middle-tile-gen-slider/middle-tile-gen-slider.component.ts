import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SliderGenerationParams, TileGenerationSliderComponent } from '../tile-generation-slider.component';

@Component({
  selector: 'igo-middle-tile-gen-slider',
  templateUrl: './middle-tile-gen-slider.component.html',
  styleUrls: ['./middle-tile-gen-slider.component.scss']
})
export class MiddleTileGenSliderComponent extends TileGenerationSliderComponent implements OnInit, AfterViewInit {

  constructor() { 
    super();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  get value(): SliderGenerationParams {
    return {
      startLevel: 0,
      endLevel: 0,
    }
  }
}
