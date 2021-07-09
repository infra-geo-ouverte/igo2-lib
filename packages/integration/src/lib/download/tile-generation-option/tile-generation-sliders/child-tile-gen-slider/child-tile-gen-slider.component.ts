import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SliderGenerationParams, TileGenerationSliderComponent } from '../tile-generation-slider.component';

@Component({
  selector: 'igo-child-tile-gen-slider',
  templateUrl: './child-tile-gen-slider.component.html',
  styleUrls: ['./child-tile-gen-slider.component.scss']
})
export class ChildTileGenSliderComponent extends TileGenerationSliderComponent implements OnInit, AfterViewInit {

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
