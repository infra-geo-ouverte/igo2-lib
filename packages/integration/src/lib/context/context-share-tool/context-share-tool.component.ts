import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { IgoMap, LayerListControlsOptions } from '@igo2/geo';

import { LayerListToolState } from '../../map/layer-list-tool.state';
import { MapState } from '../../map/map.state';
import { ShareMapComponent } from '../../../../../context/src/lib/share-map/share-map/share-map.component';

@ToolComponent({
  name: 'shareMap',
  title: 'igo.integration.tools.shareMap',
  icon: 'share-variant'
})
@Component({
    selector: 'igo-context-share-tool',
    templateUrl: './context-share-tool.component.html',
    standalone: true,
    imports: [ShareMapComponent]
})
export class ContextShareToolComponent {
  get map(): IgoMap {
    return this.mapState.map;
  }

  get layerListControls(): LayerListControlsOptions {
    return this.layerListToolState.getLayerListControls();
  }

  constructor(
    private mapState: MapState,
    private layerListToolState: LayerListToolState
  ) {}
}
