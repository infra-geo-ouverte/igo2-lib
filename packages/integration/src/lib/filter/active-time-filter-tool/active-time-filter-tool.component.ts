import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common/tool';
import {
  IgoMap,
  Layer,
  LayerController,
  TimeFilterItemComponent,
  isLayerItem
} from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { toolSlideInOut } from './active-time-filter-tool.animation';

@ToolComponent({
  name: 'activeTimeFilter',
  title: 'igo.integration.tools.timeFilter',
  icon: 'history',
  parent: 'mapTools'
})
@Component({
  selector: 'igo-active-time-filter-tool',
  templateUrl: './active-time-filter-tool.component.html',
  animations: [toolSlideInOut()],
  standalone: true,
  imports: [TimeFilterItemComponent]
})
export class ActiveTimeFilterToolComponent {
  get map(): IgoMap {
    return this.mapState.map;
  }
  get layerController(): LayerController {
    return this.map.layerController;
  }

  get layer(): Layer {
    for (const lay of this.layerController.all) {
      if (isLayerItem(lay) && this.layerController.isSelected(lay)) {
        return lay;
      }
    }
    return;
  }

  public animate = 'enter';

  constructor(public mapState: MapState) {}
}
