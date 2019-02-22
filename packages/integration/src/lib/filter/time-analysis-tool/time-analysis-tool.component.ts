import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'timeAnalysis',
  title: 'igo.integration.tools.timeAnalysis',
  icon: 'history'
})
@Component({
  selector: 'igo-time-analysis-tool',
  templateUrl: './time-analysis-tool.component.html'
})
export class TimeAnalysisToolComponent {
  constructor() {}
}
