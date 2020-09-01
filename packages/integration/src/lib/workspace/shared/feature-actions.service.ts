import { Injectable, OnDestroy } from '@angular/core';

import { Action, EntityStoreFilterCustomFuncStrategy, EntityStoreFilterSelectionStrategy } from '@igo2/common';

import { BehaviorSubject, Subscription } from 'rxjs';
import {
  FeatureWorkspace,
  mapExtentStrategyActiveToolTip,
  FeatureMotionStrategyActiveToolTip,
  FeatureStoreSelectionStrategy,
  FeatureMotion,
  noElementSelected,
  ExportOptions
} from '@igo2/geo';
import { StorageService, StorageScope, StorageServiceEvent } from '@igo2/core';
import { StorageState } from '../../storage/storage.state';
import { skipWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeatureActionsService implements OnDestroy {

  toolToActivate$: BehaviorSubject<{ tool: string; options: { [key: string]: any } }> = new BehaviorSubject(undefined);
  zoomAuto$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private storageChange$$: Subscription;


  get storageService(): StorageService {
    return this.storageState.storageService;
  }

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  get rowsInMapExtent(): boolean {
    return this.storageService.get('rowsInMapExtent') as boolean;
  }

  constructor(private storageState: StorageState) {}

  ngOnDestroy(): void {
    if (this.storageChange$$) {
      this.storageChange$$.unsubscribe();
    }
  }

  loadActions(workspace: FeatureWorkspace) {
    const actions = this.buildActions(workspace);
    workspace.actionStore.load(actions);
  }

  buildActions(workspace: FeatureWorkspace): Action[] {
    this.zoomAuto$.next(this.zoomAuto);
    this.storageChange$$ = this.storageService.storageChange$
      .pipe(skipWhile((storageChange: StorageServiceEvent) => storageChange.key !== 'zoomAuto'))
      .subscribe(() => {
        this.zoomAuto$.next(this.zoomAuto);
      }
      );

    return [
      {
        id: 'filterInMapExtent',
        checkbox: true,
        title: 'igo.geo.workspace.inMapExtent.title',
        tooltip: mapExtentStrategyActiveToolTip(workspace),
        checkCondition: this.rowsInMapExtent,
        handler: () => {
          const filterStrategy = workspace.entityStore
            .getStrategyOfType(EntityStoreFilterCustomFuncStrategy);
          if (filterStrategy.active) {
            filterStrategy.deactivate();
          } else {
            filterStrategy.activate();
          }
          this.storageService
            .set(
              'rowsInMapExtent',
              !this.storageService.get('rowsInMapExtent') as boolean,
              StorageScope.SESSION);
        }
      },
      {
        id: 'featureDownload',
        icon: 'download',
        title: 'igo.geo.workspace.download.title',
        tooltip: 'igo.geo.workspace.download.tooltip',
        handler: (ws: FeatureWorkspace) => {
          const filterStrategy = ws.entityStore.getStrategyOfType(EntityStoreFilterCustomFuncStrategy);
          const filterSelectionStrategy = ws.entityStore.getStrategyOfType(EntityStoreFilterSelectionStrategy);
          const layersWithSelection = filterSelectionStrategy.active ? [ws.layer.id] : [];
          this.toolToActivate$.next({
            tool: 'importExport',
            options: { layers: [ws.layer.id], featureInMapExtent: filterStrategy.active, layersWithSelection } as ExportOptions
          });
        },
        args: [workspace]
      },
      {
        id: 'zoomAuto',
        checkbox: true,
        title: 'igo.geo.workspace.zoomAuto.title',
        tooltip: FeatureMotionStrategyActiveToolTip(workspace),
        checkCondition: this.zoomAuto$,
        handler: () => {
          const zoomStrategy = workspace.entityStore
            .getStrategyOfType(FeatureStoreSelectionStrategy) as FeatureStoreSelectionStrategy;
          this.storageService.set('zoomAuto', !this.storageService.get('zoomAuto') as boolean);
          zoomStrategy.setMotion(this.zoomAuto ? FeatureMotion.Default : FeatureMotion.None);
        }
      },
      {
        id: 'selectedOnly',
        checkbox: true,
        title: 'igo.geo.workspace.selected.title',
        tooltip: 'selectedOnly',
        checkCondition: false,
        handler: () => {
          const filterStrategy = workspace.entityStore
            .getStrategyOfType(EntityStoreFilterSelectionStrategy);
          if (filterStrategy.active) {
            filterStrategy.deactivate();
          } else {
            filterStrategy.activate();
          }
        }
      },
      {
        id: 'clearselection',
        icon: 'select-off',
        title: 'igo.geo.workspace.clearSelection.title',
        tooltip: 'igo.geo.workspace.clearSelection.tooltip',
        handler: (ws: FeatureWorkspace) => {
          ws.entityStore.state.updateMany(ws.entityStore.view.all(), { selected: false });
        },
        args: [workspace],
        availability: (ws: FeatureWorkspace) => noElementSelected(ws)
      },
    ];
  }
}
