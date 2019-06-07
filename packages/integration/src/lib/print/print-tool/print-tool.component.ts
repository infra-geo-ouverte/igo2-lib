import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { IgoMap } from '@igo2/geo';

import { MapState } from '../../map/map.state';

@ToolComponent({
  name: 'print',
  title: 'igo.integration.tools.print',
  icon: 'printer'
})
@Component({
  selector: 'igo-print-tool',
  templateUrl: './print-tool.component.html'
})
export class PrintToolComponent {
  get map(): IgoMap {
    return this.mapState.map;
  }

  constructor(private mapState: MapState) {}
}
