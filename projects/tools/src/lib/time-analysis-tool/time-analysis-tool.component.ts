import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

@Register({
  name: 'timeAnalysis',
  title: 'igo.tools.timeAnalysis',
  icon: 'history'
})
@Component({
  selector: 'igo-time-analysis-tool',
  templateUrl: './time-analysis-tool.component.html'
})
export class TimeAnalysisToolComponent {
  constructor() {}
}
