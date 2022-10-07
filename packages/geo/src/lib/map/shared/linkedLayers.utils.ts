import { Layer, LinkedProperties } from "../../layer/shared/layers";
import { IgoMap } from "./map";

export function getLinkedLayersOptions(layer: Layer) {
    return layer.options.linkedLayers;
}

export function getIgoLayerByLinkId(map: IgoMap, id: string) {
    return map.layers.find(l => l.options.linkedLayers?.linkId === id);
}

export function layerHasLinkWithProperty(layer: Layer, property: LinkedProperties): boolean {
    let hasLinkWithProperty = false;
    const layerLLOptions = getLinkedLayersOptions(layer);
    if (layerLLOptions.links) {
        const link = layerLLOptions.links.find(l => l.properties.includes(property));
        hasLinkWithProperty = link ? true : false;
    }
    return hasLinkWithProperty;
}

export function getRootParentByProperty(map: IgoMap, layer: Layer, property: LinkedProperties): Layer {
    const layerLLOptions = getLinkedLayersOptions(layer);
    const layerLinkId = layerLLOptions.linkId;
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

export function getDirectParentLayerByProperty(map: IgoMap, layer: Layer, property: LinkedProperties): Layer {
    if (layer.options.linkedLayers?.linkId) {
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
