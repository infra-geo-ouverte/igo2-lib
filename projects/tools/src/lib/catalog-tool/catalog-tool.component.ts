import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register, ToolService } from '@igo2/context';

@Register({
  name: 'catalog',
  title: 'igo.tools.catalog',
  icon: 'photo_library'
})
@Component({
  selector: 'igo-catalog-tool',
  templateUrl: './catalog-tool.component.html'
})
export class CatalogToolComponent {
  constructor(private toolService: ToolService) {}

  handleFeatureSelect() {
    const tool = this.toolService.getTool('catalogLayers');
    if (tool) {
      this.toolService.selectTool(tool);
    }
  }
}
