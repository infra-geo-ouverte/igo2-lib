import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common/tool';
import { IgoMap, PrintComponent } from '@igo2/geo';

import { MapState } from '../../map/map.state';

@ToolComponent({
  name: 'print',
  title: 'igo.integration.tools.print',
  icon: 'print'
})
@Component({
  selector: 'igo-print-tool',
  templateUrl: './print-tool.component.html',
  standalone: true,
  imports: [PrintComponent]
})
export class PrintToolComponent {
  get map(): IgoMap {
    return this.mapState.map;
  }

  constructor(private mapState: MapState) {}
}
