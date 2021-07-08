import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { TileGenerationStrategies } from '@igo2/core';
import { TileGenerationParams } from '@igo2/core/lib/download/tile-downloader/tile-generation-strategies/tile-generation-params.interface';
import { ParentTileGenSliderComponent } from './tile-generation-sliders/parent-tile-gen-slider/parent-tile-gen-slider.component';


@Component({
  selector: 'igo-tile-generation-option',
  templateUrl: './tile-generation-option.component.html',
  styleUrls: ['./tile-generation-option.component.scss']
})
export class TileGenerationOptionComponent implements OnInit {
  @Input('onChange') onValueChange: () => void;
  @Input('disabled') disabled: boolean = false;

  @Input('parentLevel') parentLevel: number;

  @ViewChild('genSlider') generationSlider: ParentTileGenSliderComponent; // for now
  @ViewChild('strategySelect') strategySelect: MatSelect;
  
  strategies = Object.values(TileGenerationStrategies);

  private get endLevel(): number {
    return this.generationSlider.tileGenerationParams.endLevel;
  }

  private get startLevel(): number {
    return this.generationSlider.tileGenerationParams.startLevel;
  }

  constructor() { }

  ngOnInit() {
  }

  get tileGenerationParams(): TileGenerationParams {
    return {
      startLevel: this.startLevel,
      parentLevel: this.parentLevel,
      endLevel: this.endLevel,
      genMethod: this.strategySelect.value
    }
  }
}
