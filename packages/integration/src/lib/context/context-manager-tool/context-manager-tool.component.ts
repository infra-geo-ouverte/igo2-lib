import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { ToolComponent } from '@igo2/common/tool';
import { ContextListComponent } from '@igo2/context';
import { Media, MediaService } from '@igo2/core/media';
import { IgoMap } from '@igo2/geo';

import { map } from 'rxjs';

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
  imports: [ContextListComponent]
})
export class ContextManagerToolComponent {
  private toolState = inject(ToolState);
  private mapState = inject(MapState);
  private mediaService = inject(MediaService);

  readonly toolToOpenOnContextChange = input('mapTools');

  get map(): IgoMap {
    return this.mapState.map;
  }

  isDesktop = toSignal(
    this.mediaService.media$.pipe(map((value) => value === Media.Desktop))
  );

  editContext() {
    this.toolState.toolbox.activateTool('contextEditor');
  }

  managePermissions() {
    this.toolState.toolbox.activateTool('contextPermissionManager');
  }
}
