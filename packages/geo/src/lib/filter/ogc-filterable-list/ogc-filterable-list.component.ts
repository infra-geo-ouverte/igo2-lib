import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map';

@Component({
  selector: 'igo-ogc-filterable-list',
  templateUrl: './ogc-filterable-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OgcFilterableListComponent {

  set layers(value: Layer[]) {
    this._layers = value;
    this.cdRef.detectChanges();
  }
  @Input()
  get layers(): Layer[] {
    return this._layers;
  }

  set map(value: IgoMap) {
    this._map = value;
  }

  @Input()
  get map(): IgoMap {
    return this._map;
  }

  private _map: IgoMap;
  private _layers: Layer[] = [];

  constructor(private cdRef: ChangeDetectorRef) {}
}
