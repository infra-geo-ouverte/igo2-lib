import olSourceImageWMS from 'ol/source/ImageWMS';
import { getUid } from 'ol/util';

import {
  TimeFilterableDataSource,
  type TimeFilterableDataSourceOptions
} from '../../datasource/shared/datasources/';
import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import {
  OgcFilterableDataSource,
  OgcFilterableDataSourceOptions
} from '../../filter/shared/ogc-filter.interface';
import type { AnyLayer } from '../../layer/shared/layers/any-layer';
import type { Layer } from '../../layer/shared/layers/layer';
import {
  LayersLinkProperties,
  LinkedProperties
} from '../../layer/shared/layers/linked/linked-layer.interface';
import { isLayerGroup, isLayerItem } from '../../layer/utils/layer.utils';
import { MapViewController } from '../../map/shared/controllers/view';
import { LayerWatcherChange } from '../utils/layer-watcher';

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
    if (!hasLinkDeletion(layerToUse)) {
      layerToUse = undefined;
    }
  }
  return hasParentLayer ? parentLayer : layerToUse;
}

export function getAllChildLayersByDeletion(
  layers: Layer[],
  layer: Layer,
  knownChildLayers: Layer[]
): Layer[] {
  const childLayers = getLayersByDeletion(
    layers,
    layer.options.linkedLayers.links
  );
  childLayers.map((cl) => {
    knownChildLayers.push(cl);
    const directChildLayers = getLayersByDeletion(
      layers,
      cl.options.linkedLayers.links
    );
    if (directChildLayers) {
      getAllChildLayersByDeletion(layers, cl, knownChildLayers);
    }
  });
  return knownChildLayers;
}

function getDirectParentLayerByProperty(
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

function getDirectChildLayersByProperty(
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
  return linkedIds.map((lid) => findLayerByLinkId(layerItems, lid));
}

function layerHasLinkWithProperty(
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

function hasLinkDeletion(layer: Layer): boolean {
  const layerLLOptions = getLinkedLayersOptions(layer);
  return layerLLOptions?.links
    ? layerLLOptions.links.some((l) => l.syncedDelete)
    : false;
}

export function getLinkedLayersOptions(layer: Layer) {
  return layer.options.linkedLayers;
}

export function findLayerByLinkId(layers: Layer[], id: string) {
  return layers.find((l) => l.options.linkedLayers?.linkId === id);
}

function getDirectParentLayerByDeletion(
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

export function getLayersByDeletion(
  layers: Layer[],
  links: LayersLinkProperties[]
): Layer[] {
  return links
    ?.filter((l) => l.syncedDelete)
    .reduce((layerAcc, link) => {
      const linkedLayers = getLayersByLink(link, layers);
      return layerAcc.concat(linkedLayers);
    }, []);
}

function getLayersByLink(link: LayersLinkProperties, layers: Layer[]): Layer[] {
  return link.linkedIds.reduce((linkedLayers, id) => {
    const linkedLayer = findLayerByLinkId(layers, id);
    if (linkedLayer) {
      linkedLayers.push(linkedLayer);
    }
    return linkedLayers;
  }, []);
}

export function handleLayerPropertyChange(
  layers: AnyLayer[],
  change: LayerWatcherChange,
  viewController: MapViewController
) {
  if (!change) {
    return;
  }
  const ogcFilterWriter = new OgcFilterWriter();
  let isLayerProperty = true;
  let isDatasourceProperty = true;
  const key = change.event.key;
  let newValue;
  if (key === 'ogcFilters') {
    isLayerProperty = false;
    isDatasourceProperty = true;
    newValue = (
      change.layer.dataSource.options as OgcFilterableDataSourceOptions
    ).ogcFilters;
  } else if (key === 'timeFilter') {
    isLayerProperty = false;
    isDatasourceProperty = true;
    newValue = (
      change.layer.dataSource.options as TimeFilterableDataSourceOptions
    ).timeFilter;
  } else {
    isLayerProperty = true;
    isDatasourceProperty = false;
    newValue = change.layer.ol.get(key);
  }

  const initiatorLinkedLayersOptions = getLinkedLayersOptions(change.layer);
  if (initiatorLinkedLayersOptions) {
    let rootParentByProperty = getRootParentByProperty(
      layers,
      change.layer,
      key as LinkedProperties
    );
    if (!rootParentByProperty) {
      rootParentByProperty = change.layer;
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
      change.layer.options.source.options.type;
    const initiatorIgoLayerOgcFilterableDataSourceOptions = change.layer
      .dataSource.options as OgcFilterableDataSourceOptions;
    clbp.map((l) => {
      if (change.layer && l && getUid(change.layer.ol) !== getUid(l?.ol)) {
        const lLayerType = l.options.source.options.type;
        if (isLayerProperty) {
          if (key === 'visible') {
            // Exception for layer not in list when the changed layer have a group not displayed
            if (
              newValue &&
              change.layer.showInLayerList &&
              change.layer.parent &&
              !change.layer.parent.displayed
            ) {
              newValue = change.layer.displayed;
            }
            l.visible = newValue;
          }
          l.ol.set(key, newValue, true);
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
                  (change.layer.dataSource.options as any).fieldNameGeometry,
                  undefined,
                  viewController.getOlProjection()
                );
              } else if (initiatorIgoLayerSourceType === 'wms') {
                appliedOgcFilter = (
                  change.layer.dataSource as WMSDataSource
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
              change.layer.ol.getSource() as olSourceImageWMS
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
