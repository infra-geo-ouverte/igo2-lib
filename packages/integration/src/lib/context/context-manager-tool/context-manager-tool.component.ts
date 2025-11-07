import { Component, Input, inject } from '@angular/core';

import { ToolComponent } from '@igo2/common/tool';
import {
  ContextListBindingDirective,
  ContextListComponent
} from '@igo2/context';
import { IgoMap } from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { ToolState } from '../../tool/tool.state';

@ToolComponent({
  name: 'contextManager',
  title: 'igo.integration.tools.contexts',
  icon: 'star'
})
@Component({
  selector: 'igo-context-manager-tool',
  templateUrl: './context-manager-tool.component.html',
  imports: [ContextListComponent, ContextListBindingDirective]
})
export class ContextManagerToolComponent {
  private toolState = inject(ToolState);
  private mapState = inject(MapState);

  @Input() toolToOpenOnContextChange = 'mapTools';

  get map(): IgoMap {
    return this.mapState.map;
  }

  editContext() {
    this.toolState.toolbox.activateTool('contextEditor');
  }

  managePermissions() {
    this.toolState.toolbox.activateTool('contextPermissionManager');
  }
}
