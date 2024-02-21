import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import {
  OgcFilterableListBindingDirective,
  OgcFilterableListComponent
} from '@igo2/geo';

@ToolComponent({
  name: 'ogcFilter',
  title: 'igo.integration.tools.ogcFilter',
  icon: 'filter'
})
@Component({
  selector: 'igo-ogc-filter-tool',
  templateUrl: './ogc-filter-tool.component.html',
  standalone: true,
  imports: [OgcFilterableListComponent, OgcFilterableListBindingDirective]
})
export class OgcFilterToolComponent {
  constructor() {}
}
