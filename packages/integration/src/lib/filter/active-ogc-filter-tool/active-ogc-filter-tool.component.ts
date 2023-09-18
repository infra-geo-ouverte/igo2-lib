import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { MapState } from '../../map/map.state';
import { Layer, IgoMap } from '@igo2/geo';

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
  animations: [toolSlideInOut()]
})
export class ActiveOgcFilterToolComponent {
  get map(): IgoMap {
    return this.mapState.map;
  }

  get layer(): Layer {
    for (const lay of this.map.layers) {
      if (lay.options.active === true) {
        return lay;
      }
    }
    return;
  }

  public animate = 'enter';

  constructor(public mapState: MapState) {}
}
