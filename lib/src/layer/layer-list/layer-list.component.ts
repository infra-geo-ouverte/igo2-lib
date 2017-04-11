import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { IgoMap } from '../../map';
import { Layer, LayerService } from '../shared';


@Component({
  selector: 'igo-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerListComponent {

  @Input()
  get map(): IgoMap { return this._map; }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get edition() { return this._edition; }
  set edition(value: boolean) {
    this._edition = value;
  }
  private _edition: boolean = false;

  @Input()
  get color() { return this._color; }
  set color(value: string) {
    this._color = value;
  }
  private _color: string = 'primary';

  constructor(private layerService: LayerService) { }

  editLayer(layer: Layer) {
    this.layerService.editLayer(layer);
  }

}
