import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input
} from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';

@Component({
  selector: 'igo-time-filter-list',
  templateUrl: './time-filter-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeFilterListComponent {
  @Input()
  get layers(): Layer[] {
    return this._layers;
  }
  set layers(value: Layer[]) {
    this._layers = value;
    this.cdRef.detectChanges();
  }
  private _layers: Layer[] = [];

  constructor(private cdRef: ChangeDetectorRef) {}
}
