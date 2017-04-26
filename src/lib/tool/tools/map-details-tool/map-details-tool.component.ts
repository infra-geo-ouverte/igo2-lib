import { Component } from '@angular/core';

import { Register } from '../../shared';


@Register({
  name: 'map',
  title: 'igo.map',
  icon: 'map'
})
@Component({
  selector: 'igo-map-details-tool',
  templateUrl: './map-details-tool.component.html',
  styleUrls: ['./map-details-tool.component.styl']
})
export class MapDetailsToolComponent {

  constructor() { }

}
