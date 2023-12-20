import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { OgcFilterableListBindingDirective } from '../../../../../geo/src/lib/filter/ogc-filterable-list/ogc-filterable-list-binding.directive';
import { OgcFilterableListComponent } from '../../../../../geo/src/lib/filter/ogc-filterable-list/ogc-filterable-list.component';

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
