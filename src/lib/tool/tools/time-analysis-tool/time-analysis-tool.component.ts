import { Component } from '@angular/core';

import { Register } from '../../shared';


@Register({
  name: 'timeAnalysis',
  title: 'igo.timeAnalysis',
  icon: 'history'
})
@Component({
  selector: 'igo-time-analysis-tool',
  templateUrl: './time-analysis-tool.component.html',
  styleUrls: ['./time-analysis-tool.component.styl']
})
export class TimeAnalysisToolComponent {

  constructor() { }

}
