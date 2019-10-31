import { Component, Input } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { IgoMap } from '@igo2/geo';

import { MapState } from '../../map/map.state';

@ToolComponent({
  name: 'shareMap',
  title: 'igo.integration.tools.shareMap',
  icon: 'share-variant'
})
@Component({
  selector: 'igo-context-share-tool',
  templateUrl: './context-share-tool.component.html'
})
export class ContextShareToolComponent {

  get map(): IgoMap { return this.mapState.map; }

  constructor(
    private mapState: MapState
  ) {}
}
