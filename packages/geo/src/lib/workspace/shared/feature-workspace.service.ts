import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ActionStore,
  EntityTableTemplate,
  EntityStoreFilterCustomFuncStrategy,
  EntityRecord,
  EntityStoreStrategyFuncOptions,
  EntityStoreFilterSelectionStrategy,
  EntityTableColumnRenderer
} from '@igo2/common';

import {
  FeatureStore,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy,
  FeatureStoreInMapExtentStrategy,
  Feature,
  FeatureMotion,
  FeatureStoreInMapResolutionStrategy,
  FeatureStoreSearchIndexStrategy,
  GeoPropertiesStrategy
} from '../../feature';
import { LayerService, VectorLayer } from '../../layer';
import { GeoWorkspaceOptions } from '../../layer/shared/layers/layer.interface';
import { IgoMap } from '../../map';
import { SourceFieldsOptionsParams, FeatureDataSource, RelationOptions } from '../../datasource';
import { getCommonVectorSelectedStyle } from '../../style/shared/vector/commonVectorStyle';

import { FeatureWorkspace } from './feature-workspace';
import { skipWhile, take } from 'rxjs/operators';
import { ConfigService, StorageService } from '@igo2/core';

import olFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { getGeoServiceAction } from './workspace.utils';
import { PropertyTypeDetectorService } from '../../utils/propertyTypeDetector/propertyTypeDetector.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureWorkspaceService {

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  public ws$ = new BehaviorSubject<string>(undefined);

  constructor(
    private storageService: StorageService,
    private configService: ConfigService,
    private layerService: LayerService,
    private propertyTypeDetectorService: PropertyTypeDetectorService
    ) {}

  createWorkspace(layer: VectorLayer, map: IgoMap): FeatureWorkspace {
    if (layer.options.workspace?.enabled === false || layer.dataSource.options.edition) {
      return;
    }

    layer.options.workspace = Object.assign({}, layer.options.workspace,
      {
        srcId: layer.id,
        workspaceId: layer.id,
        enabled: true
      } as GeoWorkspaceOptions);


    const wks = new FeatureWorkspace({
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
    return wks;

  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], {map});
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const searchStrategy = new FeatureStoreSearchIndexStrategy({
      percentDistinctValueRatio: 2,
      sourceFields: layer.dataSource.options.sourceFields
    });
    const inMapExtentStrategy = new FeatureStoreInMapExtentStrategy({});
    const geoPropertiesStrategy = new GeoPropertiesStrategy({ map }, this.propertyTypeDetectorService);
    const inMapResolutionStrategy = new FeatureStoreInMapResolutionStrategy({});
    const selectedRecordStrategy = new EntityStoreFilterSelectionStrategy({});
    const confQueryOverlayStyle= this.configService.getConfig('queryOverlayStyle');

    const selectionStrategy = new FeatureStoreSelectionStrategy({
      layer: new VectorLayer({
        zIndex: 300,
        source: new FeatureDataSource(),
        style: (feature) => {
          return getCommonVectorSelectedStyle(Object.assign({}, {feature}, confQueryOverlayStyle.selection || {}));
        },
        showInLayerList: false,
        exportable: false,
        browsable: false
      }),
      map,
      hitTolerance: 15,
      motion: this.zoomAuto ? FeatureMotion.Default : FeatureMotion.None,
      many: true,
      dragBox: true
    });
    store.addStrategy(searchStrategy, true);
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(inMapExtentStrategy, true);
    store.addStrategy(geoPropertiesStrategy, true);
    store.addStrategy(inMapResolutionStrategy, true);
    store.addStrategy(selectionStrategy, true);
    store.addStrategy(selectedRecordStrategy, false);
    store.addStrategy(this.createFilterInMapExtentOrResolutionStrategy(), true);
    return store;
  }

  private createTableTemplate(workspace: FeatureWorkspace, layer: VectorLayer): EntityTableTemplate {
    const geoServiceAction = getGeoServiceAction(workspace, this.layerService);
    const fields = layer.dataSource.options.sourceFields || [];

    const relations = layer.dataSource.options.relations || [];

    if (fields.length === 0) {
      workspace.entityStore.entities$.pipe(
        skipWhile(val => val.length === 0),
        take(1)
      ).subscribe(entities => {
        const ol = (entities[0] as Feature).ol as olFeature<OlGeometry>;
        const columnsFromFeatures = ol.getKeys()
        .filter(
          col => !col.startsWith('_') &&
          col !== 'geometry' &&
          col !== ol.getGeometryName() &&
          !col.match(/boundedby/gi))
        .map(key => {
          return {
            name: `properties.${key}`,
            title: key,
            renderer: EntityTableColumnRenderer.UnsanitizedHTML
          };
        });
        columnsFromFeatures.unshift(...geoServiceAction);
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
        title: field.alias ? field.alias : field.name,
        renderer: EntityTableColumnRenderer.UnsanitizedHTML,
        tooltip: field.tooltip
      };
    });

    const relationsColumn = relations.map((relation: RelationOptions) => {
      return {
        name: `properties.${relation.name}`,
        title: relation.alias ? relation.alias : relation.name,
        renderer: EntityTableColumnRenderer.Icon,
        icon: relation.icon,
        parent: relation.parent,
        type: 'relation',
        tooltip: relation.tooltip,
        onClick: () => {
            this.ws$.next(relation.title);
        },
        cellClassFunc: () => {
          return { 'class_icon': true };
        }
      };
    });

    columns.push(...relationsColumn);
    columns.unshift(...geoServiceAction);
    workspace.meta.tableTemplate = {
      selection: true,
      sort: true,
      columns
    };
  }

  private createFilterInMapExtentOrResolutionStrategy(): EntityStoreFilterCustomFuncStrategy {
    const filterClauseFunc = (record: EntityRecord<object>) => {
      return record.state.inMapExtent === true && record.state.inMapResolution === true;
    };
    return new EntityStoreFilterCustomFuncStrategy({filterClauseFunc} as EntityStoreStrategyFuncOptions);
  }
}
