import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';

import { LayerOptions, VectorLayer } from '../../layer';

@Component({
  selector: 'igo-export-button',
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportButtonComponent {
  @Input()
  get layer(): Layer {
    return this._layer;
  }
  set layer(value: Layer) {
    this._layer = value;
  }
  private _layer: Layer;

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  constructor() {}

  get options(): LayerOptions {
    if (!this.layer) {
      return;
    }
    return this.layer.dataSource.options;
  }

  layerIsExportable(): boolean {
    if ((this.layer instanceof VectorLayer && this.layer.exportable === true) ||
      (this.layer.dataSource.options.download && this.layer.dataSource.options.download.url)) {
      return true;
    }
    return false;
  }
}
