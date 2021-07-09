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

  protected get startLevel(): number {
    return 0;
  }

  protected get endLevel(): number {
    return 0;
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
  }

}
