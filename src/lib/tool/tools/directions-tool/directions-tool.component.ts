import { Component } from '@angular/core';

import { Register } from '../../shared';


@Register({
  name: 'directions',
  title: 'igo.routingForm.directions',
  icon: 'directions'
})
@Component({
  selector: 'igo-directions-tool',
  templateUrl: './directions-tool.component.html',
  styleUrls: ['./directions-tool.component.styl']
})
export class DirectionsToolComponent {

  constructor() { }

}
