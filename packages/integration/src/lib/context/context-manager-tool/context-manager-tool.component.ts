import { Component, Input } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { IgoMap } from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { ToolState } from '../../tool/tool.state';
import { ContextListBindingDirective } from '../../../../../context/src/lib/context-manager/context-list/context-list-binding.directive';
import { ContextListComponent } from '../../../../../context/src/lib/context-manager/context-list/context-list.component';

@ToolComponent({
  name: 'contextManager',
  title: 'igo.integration.tools.contexts',
  icon: 'star'
})
@Component({
    selector: 'igo-context-manager-tool',
    templateUrl: './context-manager-tool.component.html',
    standalone: true,
    imports: [ContextListComponent, ContextListBindingDirective]
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
