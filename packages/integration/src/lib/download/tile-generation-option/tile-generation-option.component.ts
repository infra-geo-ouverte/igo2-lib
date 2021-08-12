import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { TileGenerationStrategies } from '@igo2/core';
import { TileGenerationParams } from '@igo2/core/lib/download/tile-downloader/tile-generation-strategies/tile-generation-params.interface';
import { SliderGenerationParams, TileGenerationSliderComponent } from './tile-generation-sliders/tile-generation-slider.component';


@Component({
  selector: 'igo-tile-generation-option',
  templateUrl: './tile-generation-option.component.html',
  styleUrls: ['./tile-generation-option.component.scss']
})
export class TileGenerationOptionComponent implements OnInit, AfterViewInit {
  @Output() valueChange: EventEmitter<TileGenerationParams> = new EventEmitter();

  private _tileGenerationParams: TileGenerationParams = {
    startLevel: undefined,
    parentLevel: undefined,
    endLevel: undefined,
    genMethod: TileGenerationStrategies.PARENT
  };

  @Input() disabled: boolean = false;
  @Input()
  get parentLevel(): number {
    return this._tileGenerationParams.parentLevel;
  }

  set parentLevel(value: number) {
    this._tileGenerationParams.parentLevel = value;
    this.cdRef.detectChanges();
    if (this.generationSlider) {
      this.updateSliderParams(this.generationSlider.value);
    }
    this.emitChanges();
  }

  @ViewChild('genSlider') generationSlider: TileGenerationSliderComponent;
  @ViewChild('strategySelect') strategySelect: MatSelect;

  strategies = Object.values(TileGenerationStrategies);

  set strategy(value: TileGenerationStrategies) {
    this._tileGenerationParams.genMethod = value;
  }

  get strategy(): TileGenerationStrategies {
    return this._tileGenerationParams.genMethod;
  }

  constructor( private cdRef: ChangeDetectorRef ) { }

  private get sliderGenerationParams() {
    return {
      startLevel: this._tileGenerationParams.startLevel,
      endLevel: this._tileGenerationParams.endLevel
    };
  }

  private set sliderGenerationParams(params: SliderGenerationParams) {
    this._tileGenerationParams.startLevel = params.startLevel;
    this._tileGenerationParams.endLevel = params.endLevel;
    this.generationSlider.value = params;
  }

  get startLevel() {
    return this.sliderGenerationParams.startLevel;
  }

  get endLevel() {
    return this.sliderGenerationParams.endLevel;
  }

  get genMethod() {
    return this.strategy;
  }

  set genMethod(value: TileGenerationStrategies) {
    this.strategy = value;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  private updateSliderParams(params: SliderGenerationParams) {
    this._tileGenerationParams.startLevel = params.startLevel;
    this._tileGenerationParams.endLevel = params.endLevel;
  }

  onSliderChange(sliderGenerationParams: SliderGenerationParams) {
    this.updateSliderParams(sliderGenerationParams);
    this.emitChanges();
  }

  private updateStrategy(strategy: TileGenerationStrategies) {
    this._tileGenerationParams.genMethod = strategy;
  }

  onSelectionChange(strategy: TileGenerationStrategies) {
    this.updateStrategy(strategy);
    const newStrategy = this.strategySelect.value;
    this.strategy = newStrategy;
    this.cdRef.detectChanges();
    this.updateSliderParams(this.generationSlider.value);
    this.emitChanges();
  }

  private emitChanges() {
    this.valueChange.emit(this.tileGenerationParams);
  }

  set tileGenerationParams(params: TileGenerationParams) {
    this._tileGenerationParams = params;
    this.parentLevel = params.parentLevel;
    this.genMethod = params.genMethod;
    this.strategy = params.genMethod;

    this.cdRef.detectChanges();

    this.sliderGenerationParams = {
      startLevel: params.startLevel,
      endLevel: params.endLevel
    };
  }

  get tileGenerationParams(): TileGenerationParams {
    return this._tileGenerationParams;
  }
}
