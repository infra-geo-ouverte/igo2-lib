import { Layer, LayersLinkProperties } from "../../layer/shared/layers";
import { IgoMap } from "./map";

export function getLinkedLayersOptions(layer: Layer) {
    return layer.options.linkedLayers;
}

export function getIgoLayerByLinkId(map: IgoMap, id: string) {
    return map.layers.find(l => l.options.linkedLayers?.linkId === id);
}

export function getDirectChildLayers(map: IgoMap, layer: Layer): Layer[] {
    let linkedIds = [];
    if (layer.options.linkedLayers.links) {
        layer.options.linkedLayers.links.map(link => {
            linkedIds = linkedIds.concat(link.linkedIds);});
    }
    return linkedIds.map(lid => getIgoLayerByLinkId(map, lid));
}

export function getDirectChildLayersByLink(map: IgoMap, layer: Layer, link: LayersLinkProperties): Layer[] {
    let linkedIds = [];
    if (layer.options.linkedLayers.links) {
        layer.options.linkedLayers.links.filter(l => l === link).map(link => {
            linkedIds = linkedIds.concat(link.linkedIds);});
    }
    return linkedIds.map(lid => getIgoLayerByLinkId(map, lid));
}

export function getRootParent(map: IgoMap, layer: Layer): Layer {
    let layerToUse = layer;
    let parentLayer = layerToUse;
    let hasParentLayer = true;
    while (hasParentLayer) {
        layerToUse = parentLayer;
        parentLayer = this.getDirectParentLayer(map, layerToUse);
        hasParentLayer = parentLayer ? true : false;
    }
    return hasParentLayer ? parentLayer : layerToUse;
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

export function getAllChildLayers(map: IgoMap, layer: Layer, knownChildLayers: Layer[]): Layer[] {
    let childLayers = this.getDirectChildLayers(map, layer);
    childLayers.map(cl => {
        knownChildLayers.push(cl);
        const directChildLayers = this.getDirectChildLayers(map, cl);
        if (directChildLayers) {
            this.getAllChildLayers(map, cl, knownChildLayers);
        }

    });
    return knownChildLayers;
}
