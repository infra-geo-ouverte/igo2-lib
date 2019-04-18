import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Layer } from '../shared/layers';
import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'igo-layer-legend',
  templateUrl: './layer-legend.component.html',
  styleUrls: ['./layer-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerLegendComponent {
  @Input()
  get layer(): Layer {
    return this._layer;
  }
  set layer(value: Layer) {
    this._layer = value;
    this._legend = value.dataSource.getLegend();
  }
  private _layer: Layer;

  get legend() {
    if (this._legend && this._legend.display === false) {
      return [];
    }
    return this._legend;
  }
  private _legend;

  constructor(private capabilitiesService: CapabilitiesService) {}

   computeItemTitle(item): Observable<string> {
    const layerOptions = this.layer.dataSource.options as any;
    if (layerOptions.type !== 'wms' && !layerOptions.optionsFromCapabilities) {
      return item.title;
    } else {
      let localLayerOptions = JSON.parse(JSON.stringify(layerOptions)); // to avoid to alter the original options.
      layerOptions.params.layers.split(',').forEach(layer => {
        if (layer === item.title) {
          localLayerOptions.params.layers = layer;
          this.capabilitiesService.getWMSOptions(localLayerOptions).subscribe(r => localLayerOptions = r);
        }
      });
      if (localLayerOptions && localLayerOptions._layerOptionsFromCapabilities) {
        return localLayerOptions._layerOptionsFromCapabilities.title;
      } else {
        return item.title;
      }
    }
  }
}
