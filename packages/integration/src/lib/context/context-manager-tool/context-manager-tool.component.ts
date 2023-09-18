import { Component, Input } from '@angular/core';

import { ToolComponent } from '@igo2/common';

import { ToolState } from '../../tool/tool.state';
import { MapState } from '../../map/map.state';
import { IgoMap } from '@igo2/geo';

@ToolComponent({
  name: 'contextManager',
  title: 'igo.integration.tools.contexts',
  icon: 'star'
})
@Component({
  selector: 'igo-context-manager-tool',
  templateUrl: './context-manager-tool.component.html'
})
export class ContextManagerToolComponent {
  @Input() toolToOpenOnContextChange: string = 'mapTools';

  get map(): IgoMap {
    return this.mapState.map;
  }

  constructor(
    private toolState: ToolState,
    private mapState: MapState
  ) {}

  editContext() {
    this.toolState.toolbox.activateTool('contextEditor');
  }

  managePermissions() {
    this.toolState.toolbox.activateTool('contextPermissionManager');
  }
}
