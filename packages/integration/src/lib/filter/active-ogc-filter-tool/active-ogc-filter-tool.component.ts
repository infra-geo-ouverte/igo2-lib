import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common/tool';
import {
  IgoMap,
  Layer,
  OgcFilterableItemComponent,
  isLayerItem
} from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { toolSlideInOut } from './active-ogc-filter-tool.animation';

@ToolComponent({
  name: 'activeOgcFilter',
  title: 'igo.integration.tools.ogcFilter',
  icon: 'filter',
  parent: 'mapTools'
})
@Component({
    selector: 'igo-active-ogc-filter-tool',
    templateUrl: './active-ogc-filter-tool.component.html',
    animations: [toolSlideInOut()],
    imports: [OgcFilterableItemComponent]
})
export class ActiveOgcFilterToolComponent {
  get map(): IgoMap {
    return this.mapState.map;
  }

  get layer(): Layer {
    for (const lay of this.map.layerController.all) {
      if (isLayerItem(lay) && this.map.layerController.isSelected(lay)) {
        return lay;
      }
    }
    return;
  }

  public animate = 'enter';

  constructor(public mapState: MapState) {}
}
