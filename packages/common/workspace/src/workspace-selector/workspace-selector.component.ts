import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  EntitySelectorChange,
  EntitySelectorComponent,
  getEntityTitle
} from '@igo2/common/entity';

import { WorkspaceStore } from '../shared/store';
import { Workspace } from '../shared/workspace';

/**
 * Drop list that activates the selected workspace emit an event.
 */
@Component({
    selector: 'igo-workspace-selector',
    templateUrl: './workspace-selector.component.html',
    styleUrls: ['./workspace-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [EntitySelectorComponent]
})
export class WorkspaceSelectorComponent {
  /**
   * Store that holds the available workspaces.
   */
  @Input() store: WorkspaceStore;

  /**
   * Wheither the selector must be disabled or not.
   */
  @Input() disabled: boolean;

  /**
   * Event emitted when an workspace is selected or unselected
   */
  @Output() selectedChange = new EventEmitter<{
    selected: boolean;
    value: Workspace;
  }>();

  /**
   * @internal
   */
  getWorkspaceTitle(workspace: Workspace): string {
    return getEntityTitle(workspace);
  }

  /**
   * When an workspace is manually selected, select it into the
   * store and emit an event.
   * @internal
   * @param event The selection change event
   */
  onSelectedChange(event: EntitySelectorChange<Workspace>) {
    const workspace = event.value;
    this.store.activateWorkspace(workspace);
    this.selectedChange.emit({ selected: true, value: workspace });
  }
}
