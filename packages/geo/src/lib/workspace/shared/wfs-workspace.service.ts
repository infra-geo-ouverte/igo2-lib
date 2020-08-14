import { Injectable, OnDestroy } from '@angular/core';

import {
  ActionStore,
  EntityTableTemplate,
  EntityStoreFilterCustomFuncStrategy,
  EntityRecord,
  EntityStoreStrategyFuncOptions
} from '@igo2/common';

import {
  FeatureStore,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy,
  FeatureStoreInMapExtentStrategy,
  Feature,
  FeatureMotion
} from '../../feature';
import { VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { SourceFieldsOptionsParams } from '../../datasource';

import { WfsWorkspace } from './wfs-workspace';
import { WfsActionsService } from './wfs-actions.service';
import { skipWhile, take } from 'rxjs/operators';
import { StorageService, StorageScope } from '@igo2/core';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WfsWorkspaceService implements OnDestroy {

  toolToActivate$: BehaviorSubject<{ tool: string; options: {[key: string]: any} }> = new BehaviorSubject(undefined);
  toolToActivate$$: Subscription;

  get zoomAutoTable(): boolean {
    return this.storageService.get('zoomAutoTable') as boolean;
  }

  constructor(
    private wfsActionsService: WfsActionsService,
    private storageService: StorageService
    ) {}

    ngOnDestroy() {
      if (this.toolToActivate$$) {
        this.toolToActivate$$.unsubscribe();
      }
    }

    createWorkspace(layer: VectorLayer, map: IgoMap): WfsWorkspace {
    const wks = new WfsWorkspace({
      id: layer.id,
      title: layer.title,
      layer,
      map,
      entityStore: this.createFeatureStore(layer, map),
      actionStore: new ActionStore([]),
      meta: {
        tableTemplate: undefined
      }
    });
    this.createTableTemplate(wks, layer);
    this.wfsActionsService.loadActions(wks);
    this.toolToActivate$$ = this.wfsActionsService.toolToActivate$.subscribe((toolToActivate) =>
    this.toolToActivate$.next(toolToActivate)
  );
    return wks;

  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], {map});
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const inMapExtentStrategy = new FeatureStoreInMapExtentStrategy({});
    const selectionStrategy = new FeatureStoreSelectionStrategy({
      map,
      hitTolerance: 15,
      motion: this.zoomAutoTable ? FeatureMotion.Default : FeatureMotion.None
    });
    this.storageService.set('rowsInMapExtent', true, StorageScope.SESSION);
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(inMapExtentStrategy, true);
    store.addStrategy(selectionStrategy, true);
    store.addStrategy(this.createFilterInMapExtentStrategy(), true);
    return store;
  }

  private createTableTemplate(workspace: WfsWorkspace,  layer: VectorLayer): EntityTableTemplate {
    const fields = layer.dataSource.options.sourceFields || [];

    if (fields.length === 0) {
      workspace.entityStore.entities$.pipe(
        skipWhile(val => val.length === 0),
        take(1)
      ).subscribe(entities => {
        const columnsFromFeatures = (entities[0] as Feature).ol.getKeys()
        .filter(
          col => !col.startsWith('_') &&
          col !== 'geometry' &&
          col !== (entities[0] as Feature).ol.getGeometryName() &&
          !col.match(/boundedby/gi))
        .map(key => {
          return {
            name: `properties.${key}`,
            title: key
          };
        });
        workspace.meta.tableTemplate = {
          selection: true,
          sort: true,
          columns: columnsFromFeatures
        };
      });
      return;
    }
    const columns = fields.map((field: SourceFieldsOptionsParams) => {
      return {
        name: `properties.${field.name}`,
        title: field.alias ? field.alias : field.name
      };
    });
    workspace.meta.tableTemplate = {
      selection: true,
      sort: true,
      columns
    };
  }

  private createFilterInMapExtentStrategy(): EntityStoreFilterCustomFuncStrategy {
    const filterClauseFunc = (record: EntityRecord<object>) => {
      return record.state.inMapExtent === true;
    };
    return new EntityStoreFilterCustomFuncStrategy({filterClauseFunc} as EntityStoreStrategyFuncOptions);
  }
}
