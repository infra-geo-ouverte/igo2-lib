import { Component } from '@angular/core';

import { Register } from '../../shared';


@Register({
  name: 'ogcFilter',
  title: 'igo.ogcFilter',
  icon: 'filter_list'
})
@Component({
  selector: 'igo-ogc-filter-tool',
  templateUrl: './ogc-filter-tool.component.html',
  styleUrls: ['./ogc-filter-tool.component.styl']
})
export class OgcFilterToolComponent {

  constructor() { }

}
