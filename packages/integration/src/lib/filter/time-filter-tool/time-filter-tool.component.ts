import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { TimeFilterListBindingDirective } from '../../../../../geo/src/lib/filter/time-filter-list/time-filter-list-binding.directive';
import { TimeFilterListComponent } from '../../../../../geo/src/lib/filter/time-filter-list/time-filter-list.component';

@ToolComponent({
  name: 'timeFilter',
  title: 'igo.integration.tools.timeFilter',
  icon: 'history'
})
@Component({
    selector: 'igo-time-filter-tool',
    templateUrl: './time-filter-tool.component.html',
    standalone: true,
    imports: [TimeFilterListComponent, TimeFilterListBindingDirective]
})
export class TimeFilterToolComponent {
  constructor() {}
}
