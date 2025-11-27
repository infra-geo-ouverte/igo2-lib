import { Injectable, inject } from '@angular/core';

import { ActionStore } from '@igo2/common/action';
import { EntityStoreFilterSelectionStrategy } from '@igo2/common/entity';
import { ConfigService } from '@igo2/core/config';
import { StorageService } from '@igo2/core/storage';

import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import { WMSDataSource } from '../../datasource/shared/datasources';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { WFSDataSourceOptions } from '../../datasource/shared/datasources/wfs-datasource.interface';
import {
  FeatureMotion,
  FeatureStore,
  FeatureStoreInMapExtentStrategy,
  FeatureStoreInMapResolutionStrategy,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy,
  GeoPropertiesStrategy
} from '../../feature/shared';
import { OgcFilterableDataSourceOptions } from '../../filter/shared/ogc-filter.interface';
import {
  GeoWorkspaceOptions,
  ImageLayer,
  LayerService,
  LayersLinkProperties,
  LinkedProperties,
  VectorLayer
} from '../../layer/shared';
import { IgoMap } from '../../map/shared/map';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { getCommonVectorSelectedStyle } from '../../style/shared/vector/commonVectorStyle';
import {
  FeatureCommonVectorStyleOptions,
  OverlayStyleOptions
} from '../../style/shared/vector/vector-style.interface';
import { StyleService } from '../../style/style-service/style.service';
import { PropertyTypeDetectorService } from '../../utils/propertyTypeDetector/propertyTypeDetector.service';
import { WfsWorkspace } from './wfs-workspace';
import {
  createFilterInMapExtentOrResolutionStrategy,
  createTableTemplate
} from './workspace.utils';

@Injectable({
  providedIn: 'root'
})
export class WmsWorkspaceService {
  private layerService = inject(LayerService);
  private storageService = inject(StorageService);
  private capabilitiesService = inject(CapabilitiesService);
  private styleService = inject(StyleService);
  private configService = inject(ConfigService);
  private propertyTypeDetectorService = inject(PropertyTypeDetectorService);

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  public ws$ = new BehaviorSubject<string>(undefined);

  createWorkspace(layer: ImageLayer, map: IgoMap): WfsWorkspace {
    if (
      !layer.options.workspace ||
      map.layerController.all.find(
        (lay) => lay.id === layer.id + '.WfsWorkspaceTableDest'
      ) ||
      layer.dataSource.options.edition
    ) {
      return;
    }
    const dataSource: WMSDataSource = layer.dataSource as WMSDataSource;
    const wmsLinkId = layer.id + '.WmsWorkspaceTableSrc';
    const wfsLinkId = layer.id + '.WfsWorkspaceTableDest';
    if (!layer.options.linkedLayers) {
      layer.options.linkedLayers = { linkId: wmsLinkId, links: [] };
    }
    const linkProperties = {
      syncedDelete: true,
      linkedIds: [wfsLinkId],
      properties: [LinkedProperties.ZINDEX, LinkedProperties.VISIBLE]
    } as LayersLinkProperties;

    if (!layer.options.workspace?.minResolution) {
      linkProperties.properties.push(LinkedProperties.MINRESOLUTION);
    }
    let hasOgcFilters = false;
    if (
      (dataSource.options as OgcFilterableDataSourceOptions).ogcFilters?.enabled
    ) {
      linkProperties.properties.push(LinkedProperties.OGCFILTERS);
      hasOgcFilters = true;
    }
    if (!layer.options.workspace?.maxResolution) {
      linkProperties.properties.push(LinkedProperties.MAXRESOLUTION);
    }
    if (dataSource.options.refreshIntervalSec) {
      linkProperties.properties.push(LinkedProperties.REFRESH);
    }

    let clonedLinks: LayersLinkProperties[] = [];
    if (layer.options.linkedLayers.links) {
      clonedLinks = JSON.parse(
        JSON.stringify(layer.options.linkedLayers.links)
      );
    }
    clonedLinks.push(linkProperties);

    // TODO: Démystifier ce bout de code
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ((layer.options.linkedLayers.linkId = layer.options.linkedLayers.linkId
      ? layer.options.linkedLayers.linkId
      : wmsLinkId),
      (layer.options.linkedLayers.links = clonedLinks));

    layer.createLink();

    interface WFSoptions
      extends WFSDataSourceOptions, OgcFilterableDataSourceOptions {}

    let wks;
    const wksLayerOption: GeoWorkspaceOptions = {
      printable: layer.options.workspace?.printable,
      srcId: layer.id,
      workspaceId: undefined,
      enabled: false,
      queryOptions: {
        mapQueryOnOpenTab:
          layer.options.workspace?.queryOptions?.mapQueryOnOpenTab,
        tabQuery: layer.options.workspace?.queryOptions?.tabQuery
      },
      pageSize: layer.options.workspace?.pageSize,
      pageSizeOptions: layer.options.workspace?.pageSizeOptions
    };

    this.layerService
      .createAsyncLayer({
        title: layer.title,
        parentId: layer.options.parentId,
        isIgoInternalLayer: true,
        visible: layer.visible,
        id: wfsLinkId,
        linkedLayers: {
          linkId: wfsLinkId
        },
        workspace: wksLayerOption,
        showInLayerList: false,
        opacity: 0,
        minResolution:
          layer.options.workspace?.minResolution || layer.minResolution || 0,
        maxResolution:
          layer.options.workspace?.maxResolution ||
          layer.maxResolution ||
          Infinity,
        style: this.styleService.createStyle({
          fill: {
            color: 'rgba(255, 255, 255, 0.01)'
          },
          stroke: {
            color: 'rgba(255, 255, 255, 0.01)'
          },
          circle: {
            fill: {
              color: 'rgba(255, 255, 255, 0.01)'
            },
            stroke: {
              color: 'rgba(255, 255, 255, 0.01)'
            },
            radius: 5
          }
        }),
        sourceOptions: {
          download: dataSource.options.download,
          type: 'wfs',
          url: dataSource.options.urlWfs || dataSource.options.url,
          queryable: true,
          relations: dataSource.options.relations,
          queryTitle: (dataSource.options as QueryableDataSourceOptions)
            .queryTitle,
          queryFormatAsWms: layer.options.workspace?.enabled
            ? (dataSource.options as QueryableDataSourceOptions)
                .queryFormatAsWms
            : true,
          params: dataSource.options.paramsWFS,
          ogcFilters: Object.assign({}, dataSource.ogcFilters, {
            enabled: hasOgcFilters
          }),
          sourceFields: dataSource.options.sourceFields || undefined
        } as WFSoptions
      })
      .subscribe((workspaceLayer: VectorLayer) => {
        map.layerController.add(workspaceLayer);
        layer.ol.setProperties(
          {
            linkedLayers: {
              linkId: layer.options.linkedLayers.linkId,
              links: clonedLinks
            }
          },
          false
        );
        workspaceLayer.dataSource.ol.refresh();

        if (!layer.options.workspace?.enabled) {
          return;
        }
        wks = new WfsWorkspace({
          id: layer.id,
          title: layer.title,
          layer: workspaceLayer,
          map,
          entityStore: this.createFeatureStore(workspaceLayer, map),
          actionStore: new ActionStore([]),
          meta: {
            tableTemplate: undefined
          }
        });
        createTableTemplate(wks, workspaceLayer, this.layerService, this.ws$);

        workspaceLayer.options.workspace.workspaceId = workspaceLayer.id;
        layer.options.workspace = Object.assign({}, layer.options.workspace, {
          enabled: true,
          srcId: layer.id,
          workspaceId: workspaceLayer.id,
          queryOptions: {
            mapQueryOnOpenTab:
              layer.options.workspace?.queryOptions?.mapQueryOnOpenTab,
            tabQuery: layer.options.workspace?.queryOptions?.tabQuery
          },
          pageSize: layer.options.workspace?.pageSize,
          pageSizeOptions: layer.options.workspace?.pageSizeOptions
        } as GeoWorkspaceOptions);

        delete dataSource.options.download;
        return wks;
      });

    return wks;
  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], { map });
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const inMapExtentStrategy = new FeatureStoreInMapExtentStrategy({});
    const geoPropertiesStrategy = new GeoPropertiesStrategy(
      { map },
      this.propertyTypeDetectorService,
      this.capabilitiesService
    );
    const inMapResolutionStrategy = new FeatureStoreInMapResolutionStrategy({});
    const selectedRecordStrategy = new EntityStoreFilterSelectionStrategy({});
    const confQueryOverlayStyle: OverlayStyleOptions =
      this.configService.getConfig('queryOverlayStyle');

    const id = layer.id + '.FeatureStore';

    if (!layer.link) {
      layer.options.linkedLayers.links = [
        {
          syncedDelete: true,
          linkedIds: [id],
          properties: [LinkedProperties.VISIBLE]
        }
      ];
      layer.createLink();
    }

    const selectionStrategy = new FeatureStoreSelectionStrategy({
      layer: new VectorLayer({
        id,
        linkedLayers: {
          linkId: id
        },
        zIndex: 300,
        source: new FeatureDataSource(),
        style: (feature) => {
          return getCommonVectorSelectedStyle(
            Object.assign(
              {},
              { feature },
              confQueryOverlayStyle?.selection || {}
            ) as FeatureCommonVectorStyleOptions
          );
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
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(inMapExtentStrategy, true);
    store.addStrategy(geoPropertiesStrategy, true);
    store.addStrategy(inMapResolutionStrategy, true);
    store.addStrategy(selectionStrategy, true);
    store.addStrategy(selectedRecordStrategy, false);
    store.addStrategy(createFilterInMapExtentOrResolutionStrategy(), true);
    return store;
  }
}
