import { Component } from '@angular/core';

import { Register, ToolService } from '../../shared';


@Register({
  name: 'catalog',
  title: 'igo.catalog',
  icon: 'photo_library'
})
@Component({
  selector: 'igo-catalog-tool',
  templateUrl: './catalog-tool.component.html',
  styleUrls: ['./catalog-tool.component.styl']
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
