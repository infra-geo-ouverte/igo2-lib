import { Component } from '@angular/core';

import { Register } from '../../shared';


@Register({
  name: 'catalogLayers',
  title: 'igo.catalog',
  icon: 'photo_library'
})
@Component({
  selector: 'igo-catalog-layers-tool',
  templateUrl: './catalog-layers-tool.component.html',
  styleUrls: ['./catalog-layers-tool.component.styl']
})
export class CatalogLayersToolComponent {

  constructor() { }

}
