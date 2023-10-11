import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { DownloadDataSourceOptions } from '../shared/download.interface';
import { DownloadService } from '../shared/download.service';

@Component({
  selector: 'igo-download-button',
  templateUrl: './download-button.component.html',
  styleUrls: ['./download-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadButtonComponent {
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

  constructor(private downloadService: DownloadService) {}

  openDownload(layer: Layer) {
    this.downloadService.open(layer);
  }

  get options(): DownloadDataSourceOptions {
    if (!this.layer) {
      return;
    }
    return this.layer.dataSource.options;
  }
}
