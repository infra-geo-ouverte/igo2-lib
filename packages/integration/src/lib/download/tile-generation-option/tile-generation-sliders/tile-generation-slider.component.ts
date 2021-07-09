import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface SliderGenerationParams {
  startLevel: number;
  endLevel: number;
}

@Component({
  selector: 'app-base',
    template: `
        <div>
            base works!!
        </div>
    `
})
export abstract class TileGenerationSliderComponent {
  @Output() onValueChange: EventEmitter<any> = new EventEmitter();

  @Input('disabled') disabled: boolean = false;
  @Input('parentLevel') parentLevel: number;

  constructor() { }

  protected emitValue() {
    this.onValueChange.emit(this.value);
  }

  abstract get value(): SliderGenerationParams;
  protected abstract get startLevel(): number;
  protected abstract get endLevel(): number;
}
