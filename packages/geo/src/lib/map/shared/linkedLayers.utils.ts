import { Layer, LinkedProperties } from "../../layer/shared/layers";
import { IgoMap } from "./map";

export function getLinkedLayersOptions(layer: Layer) {
    return layer.options.linkedLayers;
}

export function getIgoLayerByLinkId(map: IgoMap, id: string) {
    return map.layers.find(l => l.options.linkedLayers?.linkId === id);
}

export function getRootParent(map: IgoMap, layer: Layer, property?: LinkedProperties): Layer {
    let layerToUse = layer;
    let parentLayer = layerToUse;
    let hasParentLayer = true;
    while (hasParentLayer) {
        layerToUse = parentLayer;
        parentLayer = getDirectParentLayer(map, layerToUse);
        if (parentLayer) {
            const parentLinkedLayersOptions = getLinkedLayersOptions(parentLayer);
            if (property && parentLinkedLayersOptions.links) {
                const some = parentLinkedLayersOptions.links.some(l => l.properties.includes(property));
                parentLayer = some ? parentLayer : undefined;
            }
        }
        hasParentLayer = parentLayer ? true : false;
    }
    return hasParentLayer ? parentLayer : layerToUse;
}

export function getRootParentByProperty(map: IgoMap, layer: Layer, property: LinkedProperties): Layer {
    return getRootParent(map, layer, property);
}

export function getDirectParentLayer(map: IgoMap, layer: Layer): Layer {
    if (layer.options.linkedLayers?.linkId) {
        const currentLinkId = layer.options.linkedLayers.linkId;
        let parents = map.layers.filter(pl => pl.options.linkedLayers?.links?.some(l => l.linkedIds.includes(currentLinkId)));
        if (parents.length > 1) {
            console.warn(`Your layer ${layer.title || layer.id} must only have 1 parent (${parents.map(p => p.title || p.id)})
            , The first parent (${parents[0].title || parents[0].id}) will be use to sync properties`);
        }
        return parents[0];
    }
}

export function getDirectChildLayersByProperty(map: IgoMap, layer: Layer, property: LinkedProperties): Layer[] {
    let linkedIds = [];
    if (layer.options.linkedLayers.links) {
        layer.options.linkedLayers.links
        .filter(l => l.properties.includes(property))
        .map(link => {
            linkedIds = linkedIds.concat(link.linkedIds);});
    }
    return linkedIds.map(lid => getIgoLayerByLinkId(map, lid));
}

export function getAllChildLayersByProperty(map: IgoMap, layer: Layer, knownChildLayers: Layer[], property: LinkedProperties): Layer[] {
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
