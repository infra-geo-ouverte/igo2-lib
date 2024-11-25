import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { DataSourceOptions } from '../../datasource/shared/datasources';
import { VectorLayer } from '../../layer/shared';
import { Layer } from '../../layer/shared/layers/layer';

@Component({
  selector: 'igo-export-button',
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    IgoLanguageModule
  ]
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

  get options(): DataSourceOptions {
    if (!this.layer) {
      return;
    }
    return this.layer.dataSource.options;
  }

  layerIsExportable(): boolean {
    if (
      (this.layer instanceof VectorLayer && this.layer.exportable === true) ||
      (this.layer.dataSource.options.download &&
        this.layer.dataSource.options.download.url) ||
      (this.layer.options.workspace?.enabled &&
        this.layer.options.workspace?.workspaceId !== this.layer.id)
    ) {
      return true;
    }
    return false;
  }
}
