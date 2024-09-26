import { ObjectEvent } from 'ol/Object';
import olSourceImageWMS from 'ol/source/ImageWMS';
import { getUid } from 'ol/util';

import {
  TimeFilterableDataSource,
  TimeFilterableDataSourceOptions
} from '../../datasource/shared/datasources';
import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import {
  OgcFilterableDataSource,
  OgcFilterableDataSourceOptions
} from '../../filter/shared/ogc-filter.interface';
import { AnyLayer } from '../../layer/shared/layers/any-layer';
import { Layer } from '../../layer/shared/layers/layer';
import { LinkedProperties } from '../../layer/shared/layers/layer.interface';
import { isLayerGroup, isLayerItem } from '../../layer/utils/layer.utils';
import { MapViewController } from './controllers';

export function getLinkedLayersOptions(layer: Layer) {
  return layer.options.linkedLayers;
}

export function getIgoLayerByLinkId(layers: Layer[], id: string) {
  return layers.find((l) => l.options.linkedLayers?.linkId === id);
}

export function layerHasLinkWithProperty(
  layer: Layer,
  property: LinkedProperties
): boolean {
  let hasLinkWithProperty = false;
  const layerLLOptions = getLinkedLayersOptions(layer);
  if (layerLLOptions?.links) {
    const link = layerLLOptions.links.find((l) =>
      l.properties.includes(property)
    );
    hasLinkWithProperty = link ? true : false;
  }
  return hasLinkWithProperty;
}

export function layerHasLinkDeletion(layer: Layer): boolean {
  let hasLinkWithSyncedDelete = false;
  const layerLLOptions = getLinkedLayersOptions(layer);
  if (layerLLOptions?.links) {
    const link = layerLLOptions.links.find((l) => l.syncedDelete);
    hasLinkWithSyncedDelete = link ? true : false;
  }
  return hasLinkWithSyncedDelete;
}

export function getRootParentByProperty(
  layers: AnyLayer[],
  layer: Layer,
  property: LinkedProperties
): Layer {
  let layerToUse = layer;
  let parentLayer = layerToUse;
  let hasParentLayer = true;
  while (hasParentLayer) {
    layerToUse = parentLayer;
    parentLayer = getDirectParentLayerByProperty(layers, layerToUse, property);
    hasParentLayer = parentLayer ? true : false;
  }
  if (!hasParentLayer) {
    if (!layerHasLinkWithProperty(layerToUse, property)) {
      layerToUse = undefined;
    }
  }
  return hasParentLayer ? parentLayer : layerToUse;
}

export function getDirectParentLayerByProperty(
  layers: AnyLayer[],
  layer: Layer,
  property: LinkedProperties
): Layer {
  if (layer?.options.linkedLayers?.linkId) {
    const currentLinkId = layer.options.linkedLayers.linkId;
    const parents = layers.filter((pl) => {
      if (isLayerGroup(pl)) {
        return false;
      }
      const linkedLayers = pl.options.linkedLayers;
      if (linkedLayers && linkedLayers.links) {
        const a = linkedLayers.links.find(
          (l) =>
            l.linkedIds.includes(currentLinkId) &&
            l.properties.includes(property)
        );
        return a;
      }
    }) as Layer[];
    if (parents.length > 1) {
      console.warn(`Your layer ${
        layer.title || layer.id
      } must only have 1 parent (${parents.map((p) => p.title || p.id)})
            , The first parent (${
              parents[0].title || parents[0].id
            }) will be use to sync properties`);
    }
    return parents[0];
  }
}

export function getDirectChildLayersByProperty(
  layers: AnyLayer[],
  layer: Layer,
  property: LinkedProperties
): Layer[] {
  let linkedIds = [];
  if (layer?.options.linkedLayers?.links) {
    layer.options.linkedLayers.links
      .filter((l) => l.properties.includes(property))
      .map((link) => {
        linkedIds = linkedIds.concat(link.linkedIds);
      });
  }
  const layerItems = layers.filter((layer) => isLayerItem(layer)) as Layer[];
  return linkedIds.map((lid) => getIgoLayerByLinkId(layerItems, lid));
}

export function getAllChildLayersByProperty(
  layers: AnyLayer[],
  layer: Layer,
  knownChildLayers: AnyLayer[],
  property: LinkedProperties
): AnyLayer[] {
  const childLayers = getDirectChildLayersByProperty(layers, layer, property);
  childLayers.map((cl) => {
    knownChildLayers.push(cl);
    const directChildLayers = getDirectChildLayersByProperty(
      layers,
      cl,
      property
    );
    if (directChildLayers) {
      getAllChildLayersByProperty(layers, cl, knownChildLayers, property);
    }
  });
  return knownChildLayers;
}

export function getRootParentByDeletion(
  layer: Layer,
  layers: AnyLayer[]
): Layer {
  let layerToUse = layer;
  let parentLayer = layerToUse;
  let hasParentLayer = true;
  while (hasParentLayer) {
    layerToUse = parentLayer;
    parentLayer = getDirectParentLayerByDeletion(layerToUse, layers);
    hasParentLayer = parentLayer ? true : false;
  }
  if (!hasParentLayer) {
    if (!layerHasLinkDeletion(layerToUse)) {
      layerToUse = undefined;
    }
  }
  return hasParentLayer ? parentLayer : layerToUse;
}

export function getDirectParentLayerByDeletion(
  layer: Layer,
  layers: AnyLayer[]
): Layer {
  if (layer.options.linkedLayers?.linkId) {
    const currentLinkId = layer.options.linkedLayers.linkId;
    const parents = layers.filter((parent) => {
      if (isLayerGroup(parent)) {
        return false;
      }
      const linkedLayers = parent.options.linkedLayers;
      if (linkedLayers && linkedLayers.links) {
        const a = linkedLayers.links.find(
          (l) => l.linkedIds.includes(currentLinkId) && l.syncedDelete
        );
        return a;
      }
    }) as Layer[];
    if (parents.length > 1) {
      console.warn(`Your layer ${
        layer.title || layer.id
      } must only have 1 parent (${parents.map((p) => p.title || p.id)})
          , The first parent (${
            parents[0].title || parents[0].id
          }) will be use to sync properties`);
    }
    return parents[0];
  }
}

function getDirectChildLayersByDeletion(
  layers: AnyLayer[],
  layer: Layer
): Layer[] {
  const layerItems = layers.filter((layer) => isLayerItem(layer)) as Layer[];
  return layer.options.linkedLayers?.links
    ?.filter((l) => l.syncedDelete)
    .reduce((childLayer, link) => {
      const linkedLayers = link.linkedIds.reduce((linkedLayers, id) => {
        const linkedLayer = getIgoLayerByLinkId(layerItems, id);
        if (linkedLayer) {
          linkedLayers.push(linkedLayer);
        }
        return linkedLayers;
      }, []);
      return childLayer.concat(linkedLayers);
    }, []);
}

export function getAllChildLayersByDeletion(
  layers: AnyLayer[],
  layer: Layer,
  knownChildLayers: Layer[]
): Layer[] {
  const childLayers = getDirectChildLayersByDeletion(layers, layer);
  childLayers.map((cl) => {
    knownChildLayers.push(cl);
    const directChildLayers = getDirectChildLayersByDeletion(layers, cl);
    if (directChildLayers) {
      getAllChildLayersByDeletion(layers, cl, knownChildLayers);
    }
  });
  return knownChildLayers;
}

export function initLayerSyncFromRootParentLayers(
  mapLayers: AnyLayer[],
  layers: AnyLayer[]
) {
  const rootLayersByProperty = {};
  const keys = Object.keys(LinkedProperties);
  keys.map((k) => {
    rootLayersByProperty[LinkedProperties[k]] = [];
  });
  layers
    .filter((l) => isLayerItem(l) && getLinkedLayersOptions(l))
    .map((l: Layer) => {
      keys.map((key) => {
        const k = LinkedProperties[key];
        const plbp = getRootParentByProperty(
          mapLayers,
          l,
          k as LinkedProperties
        );
        const layers = rootLayersByProperty[k];
        const layersId = layers.map((l) => l.id);
        if (plbp && !layersId.includes(plbp.id)) {
          rootLayersByProperty[k].push(plbp);
        }
      });
    });
  Object.keys(rootLayersByProperty).map((k) => {
    const layers = rootLayersByProperty[k];
    layers.map((l) => l.ol.notify(k, undefined));
  });
}

export function handleLayerPropertyChange(
  layers: AnyLayer[],
  propertyChange: ObjectEvent,
  initiatorIgoLayer: Layer,
  viewController: MapViewController
) {
  if (!propertyChange) {
    return;
  }
  const ogcFilterWriter = new OgcFilterWriter();
  let isLayerProperty = true;
  let isDatasourceProperty = true;
  const key = propertyChange.key;
  let newValue;
  if (key === 'ogcFilters') {
    isLayerProperty = false;
    isDatasourceProperty = true;
    newValue = (
      initiatorIgoLayer.dataSource.options as OgcFilterableDataSourceOptions
    ).ogcFilters;
  } else if (key === 'timeFilter') {
    isLayerProperty = false;
    isDatasourceProperty = true;
    newValue = (
      initiatorIgoLayer.dataSource.options as TimeFilterableDataSourceOptions
    ).timeFilter;
  } else {
    isLayerProperty = true;
    isDatasourceProperty = false;
    newValue = initiatorIgoLayer.ol.get(key);
  }

  const initiatorLinkedLayersOptions =
    getLinkedLayersOptions(initiatorIgoLayer);
  if (initiatorLinkedLayersOptions) {
    let rootParentByProperty = getRootParentByProperty(
      layers,
      initiatorIgoLayer,
      key as LinkedProperties
    );
    if (!rootParentByProperty) {
      rootParentByProperty = initiatorIgoLayer;
    }

    const clbp = [rootParentByProperty];
    getAllChildLayersByProperty(
      layers,
      rootParentByProperty,
      clbp,
      key as LinkedProperties
    );

    let resolutionPropertyHasChanged = false;
    const initiatorIgoLayerSourceType =
      initiatorIgoLayer.options.source.options.type;
    const initiatorIgoLayerOgcFilterableDataSourceOptions = initiatorIgoLayer
      .dataSource.options as OgcFilterableDataSourceOptions;
    clbp.map((l) => {
      if (
        initiatorIgoLayer &&
        l &&
        getUid(initiatorIgoLayer.ol) !== getUid(l?.ol)
      ) {
        const lLayerType = l.options.source.options.type;
        if (isLayerProperty) {
          l.ol.set(key, newValue, true);
          if (key === 'visible') {
            l.visible = newValue;
          }
          if (key === 'minResolution' || key === 'maxResolution') {
            resolutionPropertyHasChanged = true;
          }
        } else if (isDatasourceProperty) {
          if (key === 'ogcFilters') {
            (l.dataSource as OgcFilterableDataSource).setOgcFilters(
              newValue,
              false
            );
            if (lLayerType === 'wfs') {
              l.ol.getSource().refresh();
            }
            if (lLayerType === 'wms') {
              let appliedOgcFilter;
              if (initiatorIgoLayerSourceType === 'wfs') {
                appliedOgcFilter = ogcFilterWriter.handleOgcFiltersAppliedValue(
                  initiatorIgoLayerOgcFilterableDataSourceOptions,
                  (initiatorIgoLayer.dataSource.options as any)
                    .fieldNameGeometry,
                  undefined,
                  viewController.getOlProjection()
                );
              } else if (initiatorIgoLayerSourceType === 'wms') {
                appliedOgcFilter = (
                  initiatorIgoLayer.dataSource as WMSDataSource
                ).ol.getParams().FILTER;
              }
              (l.dataSource as WMSDataSource).ol.updateParams({
                FILTER: appliedOgcFilter
              });
            }
          } else if (
            l.dataSource instanceof WMSDataSource &&
            key === 'timeFilter'
          ) {
            (l.dataSource as TimeFilterableDataSource).setTimeFilter(
              newValue,
              false
            );
            const appliedTimeFilter = (
              initiatorIgoLayer.ol.getSource() as olSourceImageWMS
            ).getParams().TIME;
            l.dataSource.ol.updateParams({ TIME: appliedTimeFilter });
          }
        }
      }
    });
    if (resolutionPropertyHasChanged) {
      viewController.resolution$.next(viewController.resolution$.value);
    }
  }
}
