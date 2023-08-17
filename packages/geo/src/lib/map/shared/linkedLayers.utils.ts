import { ObjectEvent } from "ol/Object";
import { getUid } from "ol/util";
import { WMSDataSource } from "../../datasource/shared/datasources/wms-datasource";
import { OgcFilterableDataSource, OgcFilterableDataSourceOptions } from "../../filter/shared/ogc-filter.interface";
import { Layer, LinkedProperties } from "../../layer/shared/layers";
import olSourceImageWMS from 'ol/source/ImageWMS';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import { TimeFilterableDataSource, TimeFilterableDataSourceOptions } from "../../datasource";
import { BaseMap } from "../shared/map.interface";

export function getLinkedLayersOptions(layer: Layer) {
    return layer.options.linkedLayers;
}

export function getIgoLayerByLinkId(map: BaseMap, id: string) {
    return map.layers.find(l => l.options.linkedLayers?.linkId === id);
}

export function layerHasLinkWithProperty(layer: Layer, property: LinkedProperties): boolean {
    let hasLinkWithProperty = false;
    const layerLLOptions = getLinkedLayersOptions(layer);
    if (layerLLOptions?.links) {
        const link = layerLLOptions.links.find(l => l.properties.includes(property));
        hasLinkWithProperty = link ? true : false;
    }
    return hasLinkWithProperty;
}

export function layerHasLinkDeletion(layer: Layer): boolean {
  let hasLinkWithSyncedDelete = false;
  const layerLLOptions = getLinkedLayersOptions(layer);
  if (layerLLOptions?.links) {
      const link = layerLLOptions.links.find(l => l.syncedDelete);
      hasLinkWithSyncedDelete = link ? true : false;
  }
  return hasLinkWithSyncedDelete;
}

export function getRootParentByProperty(map: BaseMap, layer: Layer, property: LinkedProperties): Layer {
    let layerToUse = layer;
    let parentLayer = layerToUse;
    let hasParentLayer = true;
    while (hasParentLayer) {
        layerToUse = parentLayer;
        parentLayer = getDirectParentLayerByProperty(map, layerToUse, property);
        hasParentLayer = parentLayer ? true : false;
    }
    if (!hasParentLayer) {
        if (!layerHasLinkWithProperty(layerToUse,property)) {
            layerToUse = undefined;
        }
    }
    return hasParentLayer ? parentLayer : layerToUse;
}

export function getDirectParentLayerByProperty(map: BaseMap, layer: Layer, property: LinkedProperties): Layer {
    if (layer?.options.linkedLayers?.linkId) {
        const currentLinkId = layer.options.linkedLayers.linkId;
        let parents = map.layers.filter(pl => {
            const linkedLayers = pl.options.linkedLayers;
            if (linkedLayers && linkedLayers.links) {
                const a = linkedLayers.links.find(l => l.linkedIds.includes(currentLinkId) && l.properties.includes(property));
                return a;
            }
        });
        if (parents.length > 1) {
            console.warn(`Your layer ${layer.title || layer.id} must only have 1 parent (${parents.map(p => p.title || p.id)})
            , The first parent (${parents[0].title || parents[0].id}) will be use to sync properties`);
        }
        return parents[0];
    }
}

export function getDirectChildLayersByProperty(map: BaseMap, layer: Layer, property: LinkedProperties): Layer[] {
    let linkedIds = [];
    if (layer?.options.linkedLayers?.links) {
        layer.options.linkedLayers.links
        .filter(l => l.properties.includes(property))
        .map(link => {
            linkedIds = linkedIds.concat(link.linkedIds);});
    }
    return linkedIds.map(lid => getIgoLayerByLinkId(map, lid));
}

export function getAllChildLayersByProperty(map: BaseMap, layer: Layer, knownChildLayers: Layer[], property: LinkedProperties): Layer[] {
    let childLayers = getDirectChildLayersByProperty(map, layer,property);
    childLayers.map(cl => {
        knownChildLayers.push(cl);
        const directChildLayers = getDirectChildLayersByProperty(map, cl, property);
        if (directChildLayers) {
            getAllChildLayersByProperty(map, cl, knownChildLayers, property);
        }

    });
    return knownChildLayers;
}

export function getRootParentByDeletion(map: BaseMap, layer: Layer): Layer {
  let layerToUse = layer;
  let parentLayer = layerToUse;
  let hasParentLayer = true;
  while (hasParentLayer) {
      layerToUse = parentLayer;
      parentLayer = getDirectParentLayerByDeletion(map, layerToUse);
      hasParentLayer = parentLayer ? true : false;
  }
  if (!hasParentLayer) {
    if (!layerHasLinkDeletion(layerToUse)) {
      layerToUse = undefined;
    }
  }
  return hasParentLayer ? parentLayer : layerToUse;
}

export function getDirectParentLayerByDeletion(map: BaseMap, layer: Layer): Layer {
  if (layer.options.linkedLayers?.linkId) {
      const currentLinkId = layer.options.linkedLayers.linkId;
      let parents = map.layers.filter(pl => {
          const linkedLayers = pl.options.linkedLayers;
          if (linkedLayers && linkedLayers.links) {
              const a = linkedLayers.links.find(l => (l.linkedIds.includes(currentLinkId) && l.syncedDelete));
              return a;
          }
      });
      if (parents.length > 1) {
          console.warn(`Your layer ${layer.title || layer.id} must only have 1 parent (${parents.map(p => p.title || p.id)})
          , The first parent (${parents[0].title || parents[0].id}) will be use to sync properties`);
      }
      return parents[0];
  }
}

export function getDirectChildLayersByDeletion(map: BaseMap, layer: Layer): Layer[] {
  let linkedIds = [];
  if (layer?.options.linkedLayers?.links) {
      layer.options.linkedLayers.links
      .filter(l => l.syncedDelete)
      .map(link => {
          linkedIds = linkedIds.concat(link.linkedIds);});
  }
  return linkedIds.map(lid => getIgoLayerByLinkId(map, lid));
}

export function getAllChildLayersByDeletion(map: BaseMap, layer: Layer, knownChildLayers: Layer[]): Layer[] {
  let childLayers = getDirectChildLayersByDeletion(map, layer);
  childLayers.map(cl => {
      knownChildLayers.push(cl);
      const directChildLayers = getDirectChildLayersByDeletion(map, cl);
      if (directChildLayers) {
        getAllChildLayersByDeletion(map, cl, knownChildLayers);
      }

  });
  return knownChildLayers;
}

export function initLayerSyncFromRootParentLayers(map: BaseMap, layers: Layer[]) {
    const rootLayersByProperty = {};
    const keys = Object.keys(LinkedProperties);
    keys.map(k => {
      rootLayersByProperty[LinkedProperties[k]] = [];
    });
    layers
      .filter(l => getLinkedLayersOptions(l))
      .map(l => {
        keys.map(key => {
          const k = LinkedProperties[key];
          const plbp = getRootParentByProperty(map, l, k as LinkedProperties);
          const layers = rootLayersByProperty[k];
          const layersId = layers.map(l => l.id);
          if (plbp && !layersId.includes(plbp.id)) {
            rootLayersByProperty[k].push(plbp);
          }
        });
      });
    Object.keys(rootLayersByProperty).map(k => {
      const layers = rootLayersByProperty[k];
      layers.map((l: Layer) => l.ol.notify(k, undefined));
    });
  }

  export function handleLayerPropertyChange(map: BaseMap, propertyChange: ObjectEvent, initiatorIgoLayer: Layer) {
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
      newValue = (initiatorIgoLayer.dataSource.options as OgcFilterableDataSourceOptions).ogcFilters;
    } else if (key === 'timeFilter') {
      isLayerProperty = false;
      isDatasourceProperty = true;
      newValue = (initiatorIgoLayer.dataSource.options as TimeFilterableDataSourceOptions).timeFilter;
    } else {
      isLayerProperty = true;
      isDatasourceProperty = false;
      newValue = initiatorIgoLayer.ol.get(key);
    }

    const initiatorLinkedLayersOptions = getLinkedLayersOptions(initiatorIgoLayer);
    if (initiatorLinkedLayersOptions) {
      let rootParentByProperty = getRootParentByProperty(map,initiatorIgoLayer, key as LinkedProperties);
      if (!rootParentByProperty) {
        rootParentByProperty = initiatorIgoLayer;
      }

      const clbp = [rootParentByProperty];
      getAllChildLayersByProperty(map, rootParentByProperty, clbp, key as LinkedProperties);

      let resolutionPropertyHasChanged = false;
      const initiatorIgoLayerSourceType = initiatorIgoLayer.options.source.options.type;
      const initiatorIgoLayerOgcFilterableDataSourceOptions = initiatorIgoLayer.dataSource.options as OgcFilterableDataSourceOptions;
      clbp.map(l => {
        if (initiatorIgoLayer && l && getUid(initiatorIgoLayer.ol) !== getUid(l?.ol)) {
          const lLayerType = l.options.source.options.type;
          if (isLayerProperty) {
          l.ol.set(key, newValue, true);
          if (key === 'visible') {
            l.visible$.next(newValue);
          }
          if (key === 'minResolution' || key === 'maxResolution') {
            resolutionPropertyHasChanged = true;
          }
          } else if (isDatasourceProperty) {
            if (key === 'ogcFilters') {
              (l.dataSource as OgcFilterableDataSource).setOgcFilters(newValue, false);
              if (lLayerType === 'wfs') {
                l.ol.getSource().refresh();
              }
              if (lLayerType === 'wms') {
                let appliedOgcFilter;
                if (initiatorIgoLayerSourceType === 'wfs') {
                  appliedOgcFilter = ogcFilterWriter.handleOgcFiltersAppliedValue(
                    initiatorIgoLayerOgcFilterableDataSourceOptions,
                    (initiatorIgoLayer.dataSource.options as any).fieldNameGeometry,
                    undefined,
                    map.viewController.getOlProjection()
                  );
                } else if (initiatorIgoLayerSourceType === 'wms') {
                  appliedOgcFilter = (initiatorIgoLayer.dataSource as WMSDataSource).ol.getParams().FILTER;
                }
                (l.dataSource as WMSDataSource).ol.updateParams({ FILTER: appliedOgcFilter });
              }
            } else if (l.dataSource instanceof WMSDataSource && key === 'timeFilter') {
              (l.dataSource as TimeFilterableDataSource).setTimeFilter(newValue, false);
              const appliedTimeFilter = (initiatorIgoLayer.ol.getSource() as olSourceImageWMS).getParams().TIME;
              l.dataSource.ol.updateParams({ TIME: appliedTimeFilter });
            }
          }
        }
      });
      if (resolutionPropertyHasChanged) {
        map.viewController.resolution$.next(map.viewController.resolution$.value);
      }


    }
  }
