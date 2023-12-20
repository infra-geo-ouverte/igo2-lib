import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import {
  TimeFilterListBindingDirective,
  TimeFilterListComponent
} from '@igo2/geo';

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
