import { Component } from '@angular/core';

import { Register } from '../../shared';


@Register({
  name: 'print',
  title: 'igo.print',
  icon: 'print'
})
@Component({
  selector: 'igo-print-tool',
  templateUrl: './print-tool.component.html',
  styleUrls: ['./print-tool.component.styl']
})
export class PrintToolComponent {

  constructor() { }

}
