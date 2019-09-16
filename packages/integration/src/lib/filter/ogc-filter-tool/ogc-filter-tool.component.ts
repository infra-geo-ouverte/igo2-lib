import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'ogcFilter',
  title: 'igo.integration.tools.ogcFilter',
  icon: 'filter'
})
@Component({
  selector: 'igo-ogc-filter-tool',
  templateUrl: './ogc-filter-tool.component.html'
})
export class OgcFilterToolComponent {
  constructor() {}
}
