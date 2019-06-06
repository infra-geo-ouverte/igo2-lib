import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'ogcFilter',
  title: 'igo.integration.tools.ogcFilter',
  icon: 'filter-list'
})
@Component({
  selector: 'igo-ogc-filter-tool',
  templateUrl: './ogc-filter-tool.component.html'
})
export class OgcFilterToolComponent {
  constructor() {}
}
