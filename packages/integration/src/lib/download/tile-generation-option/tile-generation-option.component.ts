import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { TileDownloaderService, TileGenerationStrategies } from '@igo2/core';
import { TileGenerationParams } from '@igo2/core/lib/download/tile-downloader/tile-generation-strategies/tile-generation-params.interface';
import { ParentTileGenSliderComponent } from './tile-generation-sliders/parent-tile-gen-slider/parent-tile-gen-slider.component';
import { SliderGenerationParams, TileGenerationSliderComponent } from './tile-generation-sliders/tile-generation-slider.component';


@Component({
  selector: 'igo-tile-generation-option',
  templateUrl: './tile-generation-option.component.html',
  styleUrls: ['./tile-generation-option.component.scss']
})
export class TileGenerationOptionComponent implements OnInit {
  @Output() onValueChange: EventEmitter<TileGenerationParams> = new EventEmitter();
  @Input('disabled') disabled: boolean = false;

  @Input('parentLevel') parentLevel: number;

  @ViewChild('genSlider') generationSlider: TileGenerationSliderComponent; // for now
  @ViewChild('strategySelect') strategySelect: MatSelect;
  
  strategies = Object.values(TileGenerationStrategies);
  strategy: TileGenerationStrategies = TileGenerationStrategies.PARENT;

  constructor(
    private tileDownloader: TileDownloaderService,
    private cdRef: ChangeDetectorRef
  ) { }
  
  private get sliderGenerationParams() {
    return this.generationSlider.value;
  }

  private set sliderGenerationParams(params: SliderGenerationParams) {
    this.generationSlider.value = params;
  }

  get startLevel() {
    return this.sliderGenerationParams.startLevel;
  }

  get endLevel() {
    return this.sliderGenerationParams.endLevel;
  }

  get genMethod() {
    return this.strategySelect.value;
  }

  set genMethod(value: TileGenerationStrategies) {
    this.strategySelect.value = value;
  }

  ngOnInit() {
  }

  onSliderChange(sliderGenerationParams: SliderGenerationParams) {
    this.emitChanges();
  }

  onSelectionChange(strategy: TileGenerationStrategies) {
    const newStrategy = this.strategySelect.value
    this.strategy = newStrategy;
    this.cdRef.detectChanges();
    this.emitChanges();
  }

  private emitChanges() {
    this.onValueChange.emit(this.tileGenerationParams);
  }

  set tileGenerationParams(params: TileGenerationParams) {
    this.parentLevel = params.parentLevel;
    this.genMethod = params.genMethod;
    this.strategy = params.genMethod;
    
    this.cdRef.detectChanges();

    this.sliderGenerationParams = {
      startLevel: params.startLevel,
      endLevel: params.endLevel
    }
  }

  get tileGenerationParams(): TileGenerationParams {
    return {
      startLevel: this.startLevel,
      parentLevel: this.parentLevel,
      endLevel: this.endLevel,
      genMethod: this.genMethod
    };
  }
}
