import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';

import { ToolState } from '../../tool/tool.state';

@ToolComponent({
  name: 'catalog',
  title: 'igo.integration.tools.catalog',
  icon: 'photo_library'
})
@Component({
  selector: 'igo-catalog-tool',
  templateUrl: './catalog-tool.component.html'
})
export class CatalogToolComponent {

  constructor(private toolState: ToolState) {}

  onFeatureSelect() {
    this.toolState.toolbox.activateTool('catalogLayers');
  }
}
