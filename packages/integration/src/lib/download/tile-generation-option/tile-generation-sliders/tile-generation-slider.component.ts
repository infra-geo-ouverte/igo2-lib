import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SliderGenerationParams {
  startLevel: number;
  endLevel: number;
}

@Component({
  selector: 'igo-tile-generation-base',
    template: `
        <div>
            base works!!
        </div>
    `
})
export abstract class TileGenerationSliderComponent {
  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  @Input() disabled: boolean = false;
  @Input()
  set parentLevel(value: number) {
    this._parentLevel = value;
    this.updateLevels();
  }
  get parentLevel(): number {
    return this._parentLevel;
  }
  protected _parentLevel: number;
  protected _endLevel: number;
  protected _startLevel: number;

  constructor() { }

  protected emitValue() {
    this.valueChange.emit(this.value);
  }

  abstract set value(value: SliderGenerationParams);
  abstract get value(): SliderGenerationParams;

  protected abstract updateLevels(): void;
  protected abstract get startLevel(): number;
  protected abstract get endLevel(): number;
}
