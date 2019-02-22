import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'directions',
  title: 'igo.integration.tools.directions',
  icon: 'directions'
})
@Component({
  selector: 'igo-directions-tool',
  templateUrl: './directions-tool.component.html'
})
export class DirectionsToolComponent {
  constructor() {}
}
