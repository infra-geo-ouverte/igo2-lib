import { Injectable } from '@angular/core';

import { ObjectUtils, removeQueryParameters } from '@igo2/utils';

import {
  ArcGISRestCapabilitiesLayer,
  ArcGISRestCapabilitiesLayerTypes,
  GetCapabilitiesParams,
  IArcgisVectorTileServerCapabilities
} from '../../datasource/shared/capabilities.interface';
import {
  ArcGISRestDataSourceOptions,
  MVTDataSourceOptions
} from '../../datasource/shared/datasources';
import { AnyLayerItemOptions } from '../../layer/';
import { getResolutionFromScale } from '../../map/shared/map.utils';
import { MetadataLayerOptions } from '../../metadata/shared/metadata.interface';
import { QueryFormat } from '../../query/shared/query.enums';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { generateIdFromSourceOptions } from '../../utils/id-generator';
import { Catalog } from './catalog.abstract';
import { CatalogItemType } from './catalog.enum';
import {
  CatalogItem,
  CatalogItemGroup,
  CatalogItemLayer
} from './catalog.interface';
import { computeForcedProperties, testLayerRegexes } from './catalog.utils';

interface ArcgisRestCapabilities {
  type?: string;
  layers?: ArcGISRestCapabilitiesLayer[];
  error?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class ArcgisCatalog {
  read(
    catalog: Catalog,
    capabilities: IArcgisVectorTileServerCapabilities | ArcgisRestCapabilities
  ):
    | CatalogItem[]
    | CatalogItemLayer<MetadataLayerOptions>[]
    | CatalogItemLayer<AnyLayerItemOptions>[] {
    // Handle VectorTileServer
    if (capabilities.type === 'indexedVector') {
      return [
        this.readVectorTileServer(
          catalog,
          capabilities as IArcgisVectorTileServerCapabilities
        )
      ];
    }

    const groups: ArcGISRestCapabilitiesLayer[] = !capabilities.layers
      ? []
      : (capabilities as ArcgisRestCapabilities).layers!.filter(
          (layer) => layer.subLayerIds
        );
    const layers: ArcGISRestCapabilitiesLayer[] = !capabilities.layers
      ? []
      : (capabilities as ArcgisRestCapabilities).layers!.filter(
          (layer) =>
            !layer.type ||
            layer.type === ArcGISRestCapabilitiesLayerTypes.FeatureLayer ||
            layer.type === ArcGISRestCapabilitiesLayerTypes.RasterLayer
        );

    const regexes = (catalog.regFilters || []).map(
      (pattern: string) => new RegExp(pattern)
    );

    const items = layers
      .map((layer) => {
        const propertiesToForce = computeForcedProperties(
          layer.name,
          catalog.forcedProperties ?? []
        );
        const baseAbstract = catalog.abstract;
        let extern = true;

        const metadataUrl =
          propertiesToForce?.metadataUrl || propertiesToForce?.metadataUrlAll;
        const metadataAbstract =
          propertiesToForce?.metadataAbstract ||
          propertiesToForce?.metadataAbstractAll ||
          baseAbstract;

        if (
          !propertiesToForce?.metadataUrl &&
          !propertiesToForce?.metadataUrlAll &&
          (propertiesToForce?.metadataAbstract ||
            propertiesToForce?.metadataAbstractAll)
        ) {
          extern = false;
        }
        if (
          propertiesToForce?.metadataAbstract &&
          propertiesToForce?.metadataUrlAll
        ) {
          extern = false;
        }

        if (testLayerRegexes(layer.id.toString(), regexes) === false) {
          return undefined;
        }
        const baseSourceOptions: ArcGISRestDataSourceOptions &
          QueryableDataSourceOptions = {
          type: catalog.type as ArcGISRestDataSourceOptions['type'],
          url: removeQueryParameters(catalog.url, [...GetCapabilitiesParams]),
          layer: layer.id.toString(),
          queryable: true,
          queryFormat: QueryFormat.ESRIJSON,
          optionsFromCapabilities: true
        };
        const sourceOptions: ArcGISRestDataSourceOptions = Object.assign(
          {},
          baseSourceOptions,
          catalog.sourceOptions
        );
        return ObjectUtils.removeUndefined({
          id: generateIdFromSourceOptions(sourceOptions),
          type: CatalogItemType.Layer,
          title: propertiesToForce?.title
            ? propertiesToForce.title
            : layer.name,
          externalProvider: catalog.externalProvider,
          options: {
            sourceOptions,
            minResolution: getResolutionFromScale(layer.maxScale),
            maxResolution: getResolutionFromScale(layer.minScale),
            metadata: {
              url: metadataUrl,
              extern,
              abstract: metadataAbstract,
              type: catalog.type
            }
          }
        } as CatalogItem);
      })
      .filter((item): item is CatalogItemLayer => item !== undefined);
    const groupHandledLayersIds: string[] = [];
    const groupedItems: CatalogItemGroup[] = groups
      .map((group) => {
        return {
          address: `catalog.group.${group.name}`,
          id: `catalog.group.${group.name}`,
          type: CatalogItemType.Group,
          externalProvider: catalog.externalProvider,
          sortDirection: catalog.sortDirection,
          title: group.name,
          items: items
            .filter((i) => {
              const subLayerIdsStr = group.subLayerIds.map((r) => r.toString());
              return subLayerIdsStr.includes(
                (i.options.sourceOptions as ArcGISRestDataSourceOptions).layer
              );
            })
            .map((i) => {
              groupHandledLayersIds.push(i.id);
              return Object.assign({}, i, {
                address: `catalog.group.${group.name}`
              });
            })
        };
      })
      .filter((g) => g.items.length);

    if (groups) {
      const TitleOrId = catalog.title || catalog.id;
      const nonHandledLayers = items
        .filter((i) => !groupHandledLayersIds.includes(i.id))
        .map((i) =>
          Object.assign({}, i, {
            address: `catalog.group.${TitleOrId}`
          })
        );
      if (nonHandledLayers.length) {
        const nonHandledGroup: CatalogItemGroup = {
          address: `catalog.group.${TitleOrId}`,
          id: `catalog.group.${TitleOrId}`,
          type: CatalogItemType.Group,
          externalProvider: catalog.externalProvider,
          sortDirection: catalog.sortDirection,
          title: TitleOrId,
          items: nonHandledLayers
        };
        groupedItems.push(nonHandledGroup);
      }
    }

    return groups ? groupedItems : items;
  }

  /**
   * Creates a CatalogItemLayer for a vector tile server if the format is supported.
   */
  private readVectorTileServer(
    catalog: Catalog,
    layer: IArcgisVectorTileServerCapabilities
  ): CatalogItemLayer<AnyLayerItemOptions> {
    let catalogUrl = catalog.url;
    if (catalogUrl.endsWith('/')) {
      catalogUrl = catalogUrl.slice(0, -1);
    }

    const sourceOptions: MVTDataSourceOptions = {
      format: layer.tileInfo.format,
      type: 'mvt',
      url: `${catalogUrl}/${layer.tiles[0]}`,
      optionsFromCapabilities: true,
      attributions: layer.copyrightText,
      id: layer.name
    };

    const layerOptions: AnyLayerItemOptions = {
      sourceOptions,
      title: layer.name,
      minResolution: layer.maxScale
        ? getResolutionFromScale(layer.maxScale)
        : undefined,
      maxResolution: layer.minScale
        ? getResolutionFromScale(layer.minScale)
        : undefined,
      igoStyle: {
        mapboxStyle: {
          url: `${catalogUrl}/${layer.defaultStyles}`,
          source: 'esri'
        }
      }
    };

    return {
      id: layer.name,
      type: CatalogItemType.Layer,
      title: layer.name,
      address: catalog.id,
      externalProvider: catalog.externalProvider,
      options: layerOptions
    };
  }
}
