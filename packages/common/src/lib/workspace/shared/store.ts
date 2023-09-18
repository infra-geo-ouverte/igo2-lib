import { EntityStore } from '../../entity';
import { Workspace } from './workspace';
import { BehaviorSubject } from 'rxjs';

/**
 * The class is a specialized version of an EntityStore that stores
 * workspaces.
 */
export class WorkspaceStore extends EntityStore<Workspace> {
  activeWorkspace$: BehaviorSubject<Workspace> = new BehaviorSubject(undefined);

  /**
   * Activate the an workspace workspace and deactivate the one currently active
   * @param workspace Workspace
   */
  activateWorkspace(workspace: Workspace) {
    const active = this.activeWorkspace$.value;
    if (active !== undefined) {
      active.deactivate();
    }

    this.deactivateWorkspace();
    if (workspace !== undefined) {
      this.state.update(workspace, { active: true, selected: true }, true);
      this.activeWorkspace$.next(workspace);
      workspace.activate();
    }
  }

  /**
   * Deactivate the current workspace
   * @param workspace Workspace
   */
  deactivateWorkspace() {
    const active = this.activeWorkspace$.value;
    if (active !== undefined) {
      active.deactivate();
      this.activeWorkspace$.next(undefined);
    }
  }
}
