import { Component, inject } from '@angular/core';

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
  imports: [PrintComponent]
})
export class PrintToolComponent {
  private mapState = inject(MapState);

  get map(): IgoMap {
    return this.mapState.map;
  }
}
