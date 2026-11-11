import { Injectable, inject } from '@angular/core';

import { FeatureDataSource } from '../../datasource/shared/datasources';
import { LayerService } from '../../layer/shared/layer.service';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import type { MapBase } from '../../map/shared/map.abstract';
import { AnyStyle } from '../../style/shared';
import { baseOlStyle } from '../../style/shared/style.utils';
import { Overlay } from './overlay';

@Injectable({ providedIn: 'root' })
export class OverlayService {
  private layerService = inject(LayerService);

  create<T extends MapBase>(map: T, style?: AnyStyle): Overlay<T> {
    const layer = this.layerService.createLayer({
      title: 'Overlay',
      zIndex: 300,
      source: new FeatureDataSource(),
      style: style ?? baseOlStyle()
    }) as VectorLayer;

    return new Overlay(map, layer);
  }
}
