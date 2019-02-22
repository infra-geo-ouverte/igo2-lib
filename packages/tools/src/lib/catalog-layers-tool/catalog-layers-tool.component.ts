import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

@Register({
  name: 'catalogLayers',
  title: 'igo.tools.catalog',
  icon: 'photo_library'
})
@Component({
  selector: 'igo-catalog-layers-tool',
  templateUrl: './catalog-layers-tool.component.html'
})
export class CatalogLayersToolComponent {
  constructor() {}
}
