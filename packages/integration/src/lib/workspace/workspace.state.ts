import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { EntityRecord, Workspace, WorkspaceStore } from '@igo2/common';

/**
 * Service that holds the state of the workspace module
 */
@Injectable({
  providedIn: 'root'
})
export class WorkspaceState {

  /**
   * Observable of the active workspace
   */
  public workspace$ = new BehaviorSubject<Workspace>(undefined);

  /**
   * Store that holds all the available workspaces
   */
  get store(): WorkspaceStore { return this._store; }
  private _store: WorkspaceStore;

  constructor() {
    this._store = new WorkspaceStore([]);
    this._store.stateView
      .firstBy$((record: EntityRecord<Workspace>) => record.state.active === true)
      .subscribe((record: EntityRecord<Workspace>) => {
        const workspace = record ? record.entity : undefined;
        this.workspace$.next(workspace);
      });
  }

}
