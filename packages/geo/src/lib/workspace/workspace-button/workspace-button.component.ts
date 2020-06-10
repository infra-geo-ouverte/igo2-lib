import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';

@Component({
  selector: 'igo-workspace-button',
  templateUrl: './workspace-button.component.html',
  styleUrls: ['./workspace-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceButtonComponent {

  @Input() layer: Layer;

  @Input() color: string = 'primary';

  @Input() workspaceEnabled: boolean = false;

  constructor() {}

  hasWorkspace() {
    return this.workspaceEnabled && this.layer instanceof VectorLayer;
  }
}
