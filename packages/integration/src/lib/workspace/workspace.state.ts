import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { EntityRecord, Workspace, WorkspaceStore, Widget } from '@igo2/common';
import { WfsWorkspace, FeatureWorkspace } from '@igo2/geo';
import { FeatureActionsService } from './shared/feature-actions.service';
import { WfsActionsService } from './shared/wfs-actions.service';
import { StorageService } from '@igo2/core';

/**
 * Service that holds the state of the workspace module
 */
@Injectable({
  providedIn: 'root'
})
export class WorkspaceState implements OnDestroy {

  public workspacePanelExpanded: boolean = false;

  readonly workspaceEnabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  readonly workspaceFullExtent$: BehaviorSubject<boolean> = new BehaviorSubject(
    this.storageService.get('workspaceFullExtent') as boolean
  );
  private actionFullExtent$$: Subscription[] = [];

  /** Subscription to the active workspace */
  private activeWorkspace$$: Subscription;

  /** Subscription to the active workspace widget */
  private activeWorkspaceWidget$$: Subscription;

  /** Active widget observable. Only one may be active for all available workspaces */
  readonly activeWorkspaceWidget$: BehaviorSubject<Widget> = new BehaviorSubject<Widget>(undefined);

  /**
   * Observable of the active workspace
   */
  public workspace$ = new BehaviorSubject<Workspace>(undefined);

  /**
   * Store that holds all the available workspaces
   */
  get store(): WorkspaceStore { return this._store; }
  private _store: WorkspaceStore;

  constructor(
    private featureActionsService: FeatureActionsService,
    private wfsActionsService: WfsActionsService,
    private storageService: StorageService
  ) {
    this.initWorkspaces();
  }

  /**
   * Initialize the workspace store. Each time a workspace is activated,
   * subscribe to it's active widget. Tracking the active widget is useful
   * to make sure only one widget is active at a time.
   */
  private initWorkspaces() {
    this._store = new WorkspaceStore([]);
    this._store.stateView
      .firstBy$((record: EntityRecord<Workspace>) => record.state.active === true)
      .subscribe((record: EntityRecord<Workspace>) => {
        const workspace = record ? record.entity : undefined;
        this.workspace$.next(workspace);
      });

    this._store.stateView.all$()
    .subscribe((workspaces: EntityRecord<Workspace>[]) => {
      workspaces.map((wks: EntityRecord<Workspace>) => {
        if (wks.entity.actionStore.empty) {
          if (wks.entity instanceof WfsWorkspace) {
            this.wfsActionsService.loadActions(wks.entity);
          } else if (wks.entity instanceof FeatureWorkspace) {
            this.featureActionsService.loadActions(wks.entity);
          }
        }

      });
    });

    this.actionFullExtent$$.push(this.featureActionsService.getWorkspaceFullExtentEmitter().subscribe(r => {
      this.workspaceFullExtent$.next(r);
    }));

    this.actionFullExtent$$.push(this.wfsActionsService.getWorkspaceFullExtentEmitter().subscribe(r => {
      this.workspaceFullExtent$.next(r);
    }));

    this.activeWorkspace$$ = this.workspace$
      .subscribe((workspace: Workspace) => {
        if (this.activeWorkspaceWidget$$ !== undefined) {
          this.activeWorkspaceWidget$$.unsubscribe();
          this.activeWorkspaceWidget$$ = undefined;
        }

        if (workspace !== undefined) {
          this.activeWorkspaceWidget$$ = workspace.widget$
            .subscribe((widget: Widget) => this.activeWorkspaceWidget$.next(widget));
        }
      });
  }

  public setActiveWorkspaceById(id: string) {
    const wksFromId = this.store
    .all()
    .find(workspace  => workspace.id === id);
    if (wksFromId) {
      this.store.activateWorkspace(wksFromId);
    }
  }

  /**
   * Teardown all the workspaces
   * @internal
   */
  ngOnDestroy() {
    this.teardownWorkspaces();
    this.actionFullExtent$$.map(a => a.unsubscribe());
  }

  /**
   * Teardown the workspace store and any subscribers
   */
  private teardownWorkspaces() {
    this.store.clear();
    if (this.activeWorkspaceWidget$$ !== undefined) {
      this.activeWorkspaceWidget$$.unsubscribe();
    }
    if (this.activeWorkspace$$ !== undefined) {
      this.activeWorkspace$$.unsubscribe();
    }
  }

}
