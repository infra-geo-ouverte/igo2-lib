import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

@Register({
  name: 'ogcFilter',
  title: 'igo.tools.ogcFilter',
  icon: 'filter_list'
})
@Component({
  selector: 'igo-ogc-filter-tool',
  templateUrl: './ogc-filter-tool.component.html'
})
export class OgcFilterToolComponent {
  constructor() {}
}
