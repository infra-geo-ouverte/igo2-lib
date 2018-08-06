import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';

@Component({
  selector: 'igo-ogc-filterable-list',
  templateUrl: './ogc-filterable-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OgcFilterableListComponent {
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
