import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { IgoMap } from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { PrintComponent } from '../../../../../geo/src/lib/print/print/print.component';

@ToolComponent({
  name: 'print',
  title: 'igo.integration.tools.print',
  icon: 'printer'
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
