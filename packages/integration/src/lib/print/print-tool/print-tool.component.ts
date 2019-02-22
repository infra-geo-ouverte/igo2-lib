import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'print',
  title: 'igo.integration.tools.print',
  icon: 'print'
})
@Component({
  selector: 'igo-print-tool',
  templateUrl: './print-tool.component.html'
})
export class PrintToolComponent {
  constructor() {}
}
