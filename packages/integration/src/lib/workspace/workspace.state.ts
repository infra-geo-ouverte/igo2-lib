import { Injectable, OnDestroy } from '@angular/core';

import {
  EntityRecord,
  EntityState,
  EntityStoreFilterCustomFuncStrategy,
  EntityStoreFilterSelectionStrategy
} from '@igo2/common/entity';
import { Widget } from '@igo2/common/widget';
import { Workspace, WorkspaceStore } from '@igo2/common/workspace';
import { StorageService } from '@igo2/core/storage';
import { EditionWorkspace, FeatureWorkspace, WfsWorkspace } from '@igo2/geo';

import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';

import { EditionActionsService } from './shared/edition-actions.service';
import { FeatureActionsService } from './shared/feature-actions.service';
import { WfsActionsService } from './shared/wfs-actions.service';

/**
 * Service that holds the state of the workspace module
 */
@Injectable({
  providedIn: 'root'
})
export class WorkspaceState implements OnDestroy {
  public workspacePanelExpanded = false;

  readonly workspaceEnabled$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  readonly rowsInMapExtentCheckCondition$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);
  readonly selectOnlyCheckCondition$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  readonly workspaceMaximize$: BehaviorSubject<boolean>;
  private actionMaximize$$: Subscription[] = [];

  private rowsInMapExtentCheckCondition$$: Subscription;
  private selectOnlyCheckCondition$$: Subscription;

  /** Subscription to the active workspace */
  private activeWorkspace$$: Subscription;

  /** Subscription to the active workspace widget */
  private activeWorkspaceWidget$$: Subscription;

  /** Active widget observable. Only one may be active for all available workspaces */
  readonly activeWorkspaceWidget$: BehaviorSubject<Widget> =
    new BehaviorSubject<Widget>(undefined);

  /**
   * Observable of the active workspace
   */
  public workspace$ = new BehaviorSubject<Workspace>(undefined);

  /**
   * Store that holds all the available workspaces
   */
  get store(): WorkspaceStore {
    return this._store;
  }
  private _store: WorkspaceStore;

  get workspaceSelection() {
    if (this.workspace$.value) {
      return this.workspace$.value?.entityStore.stateView.manyBy(
        (r) => r.state.selected === true
      );
    } else {
      return [];
    }
  }

  get workspaceSelection$(): Observable<EntityRecord<object, EntityState>[]> {
    if (this.workspace$.value) {
      return this.workspace$.value?.entityStore?.stateView.manyBy$(
        (r) => r.state.selected === true
      );
    } else {
      return of([]);
    }
  }

  constructor(
    private featureActionsService: FeatureActionsService,
    private wfsActionsService: WfsActionsService,
    private editionActionsService: EditionActionsService,
    private storageService: StorageService
  ) {
    this.workspaceMaximize$ = new BehaviorSubject(
      this.storageService.get('workspaceMaximize') as boolean
    );
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
      .firstBy$(
        (record: EntityRecord<Workspace>) => record.state.active === true
      )
      .subscribe((record: EntityRecord<Workspace>) => {
        const workspace = record ? record.entity : undefined;
        this.workspace$.next(workspace);
      });

    this._store.stateView
      .all$()
      .subscribe((workspaces: EntityRecord<Workspace>[]) => {
        workspaces.map((wks: EntityRecord<Workspace>) => {
          if (wks.entity.actionStore.empty) {
            if (wks.entity instanceof WfsWorkspace) {
              this.wfsActionsService.loadActions(
                wks.entity,
                this.rowsInMapExtentCheckCondition$,
                this.selectOnlyCheckCondition$
              );
            } else if (wks.entity instanceof FeatureWorkspace) {
              this.featureActionsService.loadActions(
                wks.entity,
                this.rowsInMapExtentCheckCondition$,
                this.selectOnlyCheckCondition$
              );
            } else if (wks.entity instanceof EditionWorkspace) {
              this.editionActionsService.loadActions(
                wks.entity,
                this.rowsInMapExtentCheckCondition$,
                this.selectOnlyCheckCondition$
              );
            }
          }
        });
      });

    this.actionMaximize$$.push(
      this.featureActionsService.maximize$.subscribe((maximized) => {
        this.setWorkspaceIsMaximized(maximized);
      })
    );

    this.actionMaximize$$.push(
      this.wfsActionsService.maximize$.subscribe((maximized) => {
        this.setWorkspaceIsMaximized(maximized);
      })
    );

    this.actionMaximize$$.push(
      this.editionActionsService.maximize$.subscribe((maximized) => {
        this.setWorkspaceIsMaximized(maximized);
      })
    );

    this.activeWorkspace$$ = this.workspace$.subscribe(
      (workspace: Workspace) => {
        if (this.activeWorkspaceWidget$$ !== undefined) {
          this.activeWorkspaceWidget$$.unsubscribe();
          this.activeWorkspaceWidget$$ = undefined;
        }

        if (workspace !== undefined) {
          this.activeWorkspaceWidget$$ = workspace.widget$.subscribe(
            (widget: Widget) => this.activeWorkspaceWidget$.next(widget)
          );
        }
      }
    );

    this.rowsInMapExtentCheckCondition$$ =
      this.rowsInMapExtentCheckCondition$.subscribe((rowsInMapExtent) => {
        this._store.stateView.all().map((wks: EntityRecord<Workspace>) => {
          if (!wks.entity.actionStore.empty) {
            const filterStrategy = wks.entity.entityStore.getStrategyOfType(
              EntityStoreFilterCustomFuncStrategy
            );
            if (filterStrategy) {
              if (rowsInMapExtent) {
                filterStrategy.activate();
              } else {
                filterStrategy.deactivate();
              }
            }
          }
        });
      });

    this.selectOnlyCheckCondition$$ = this.selectOnlyCheckCondition$.subscribe(
      (selectOnly) => {
        this._store.stateView.all().map((wks: EntityRecord<Workspace>) => {
          if (!wks.entity.actionStore.empty) {
            const filterStrategy = wks.entity.entityStore.getStrategyOfType(
              EntityStoreFilterSelectionStrategy
            );
            if (filterStrategy) {
              if (selectOnly) {
                filterStrategy.activate();
              } else {
                filterStrategy.deactivate();
              }
            }
          }
        });
      }
    );
  }

  private setWorkspaceIsMaximized(maximized: boolean) {
    this.storageService.set('workspaceMaximize', maximized);
    this.workspaceMaximize$.next(maximized);
  }

  public setActiveWorkspaceById(id: string) {
    const wksFromId = this.store.all().find((workspace) => workspace.id === id);
    if (wksFromId) {
      this.store.activateWorkspace(wksFromId);
    }
  }

  public setActiveWorkspaceByTitle(title: string) {
    const wksFromTitle = this.store
      .all()
      .find((workspace) => workspace.title === title);
    if (wksFromTitle) {
      this.store.activateWorkspace(wksFromTitle);
    }
  }

  /**
   * Teardown all the workspaces
   * @internal
   */
  ngOnDestroy() {
    this.teardownWorkspaces();
    this.actionMaximize$$.map((a) => a.unsubscribe());
    if (this.rowsInMapExtentCheckCondition$$) {
      this.selectOnlyCheckCondition$$.unsubscribe();
    }
    if (this.selectOnlyCheckCondition$$) {
      this.selectOnlyCheckCondition$$.unsubscribe();
    }
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
