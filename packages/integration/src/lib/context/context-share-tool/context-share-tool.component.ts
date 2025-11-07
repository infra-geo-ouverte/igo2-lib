import { Component, inject } from '@angular/core';

import { ToolComponent } from '@igo2/common/tool';
import { ShareMapComponent } from '@igo2/context';
import { IgoMap, LayerListControlsOptions } from '@igo2/geo';

import { LayerListToolState } from '../../map/layer-list-tool.state';
import { MapState } from '../../map/map.state';

@ToolComponent({
  name: 'shareMap',
  title: 'igo.integration.tools.shareMap',
  icon: 'share'
})
@Component({
  selector: 'igo-context-share-tool',
  templateUrl: './context-share-tool.component.html',
  imports: [ShareMapComponent]
})
export class ContextShareToolComponent {
  private mapState = inject(MapState);
  private layerListToolState = inject(LayerListToolState);

  get map(): IgoMap {
    return this.mapState.map;
  }

  get layerListControls(): LayerListControlsOptions {
    return this.layerListToolState.getLayerListControls();
  }
}
