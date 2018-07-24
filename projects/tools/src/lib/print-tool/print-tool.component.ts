import { Component ,
CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { Register } from '@igo2/geo';

@Register({
  name: 'print',
  title: 'igo.tools.print',
  icon: 'print'
})
@Component({
  selector: 'igo-print-tool',
  templateUrl: './print-tool.component.html'
})
export class PrintToolComponent {
  constructor() {}
}
