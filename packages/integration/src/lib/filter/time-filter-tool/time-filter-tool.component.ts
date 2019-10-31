import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'timeFilter',
  title: 'igo.integration.tools.timeFilter',
  icon: 'history'
})
@Component({
  selector: 'igo-time-filter-tool',
  templateUrl: './time-filter-tool.component.html'
})
export class TimeFilterToolComponent {
  constructor() {}
}
