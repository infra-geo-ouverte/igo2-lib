import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'catalogLayers',
  title: 'igo.integration.tools.catalog',
  icon: 'photo_library'
})
@Component({
  selector: 'igo-catalog-layers-tool',
  templateUrl: './catalog-layers-tool.component.html'
})
export class CatalogLayersToolComponent {
  constructor() {}
}
