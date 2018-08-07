import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';

import {
  MetadataOptions,
  MetadataDataSourceOptions
} from '../shared/metadata.interface';
import { MetadataService } from '../shared/metadata.service';

@Component({
  selector: 'igo-metadata-button',
  templateUrl: './metadata-button.component.html',
  styleUrls: ['./metadata-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetadataButtonComponent {
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

  constructor(private metadataService: MetadataService) {}

  openMetadata(metadata: MetadataOptions) {
    this.metadataService.open(metadata);
  }

  get options(): MetadataDataSourceOptions {
    if (!this.layer) {
      return;
    }
    return this.layer.dataSource.options;
  }
}
