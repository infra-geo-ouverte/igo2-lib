import { Watcher } from '@igo2/utils';
import { Layer } from '../shared/layers/layer';
import olLayer from 'ol/layer/Layer';
import olSource from 'ol/source/Source';
import { DataSource } from '../../datasource/shared/datasources/datasource';
import { IgoMap } from '../../map/shared/map';
import { LayersLink, LinkedProperties } from '../shared/layers/layer.interface';
import { OgcFilterableDataSource, OgcFilterableDataSourceOptions } from '../../filter/shared/ogc-filter.interface';
import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import { TimeFilterableDataSource } from '../../filter/shared/time-filter.interface';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import olSourceImageWMS from 'ol/source/ImageWMS';
import BaseEvent from 'ol/events/Event';
import { ObjectEvent } from 'ol/Object';

export class LayerSyncWatcher extends Watcher {
    private ogcFilters$$: Subscription;
    private timeFilter$$: Subscription;

    private ol: olLayer<olSource>;
    private layer: Layer;
    private dataSource: DataSource;
    private map: IgoMap;
    private ogcFilterWriter;


    constructor(layer: Layer, map: IgoMap) {
        super();
        this.ol = layer.ol;
        this.layer = layer;
        this.dataSource = layer.options.source;
        this.map = map;
        this.ogcFilterWriter = new OgcFilterWriter();
    }

    protected watch() {
        

    /*    this.ol.on('propertychange', evt => this.transferCommonProperties(evt));
        if ((this.dataSource as OgcFilterableDataSource).ogcFilters$) {
            this.ogcFilters$$ = (this.dataSource as OgcFilterableDataSource).ogcFilters$
                .subscribe(ogcFilters => this.transferOgcFiltersProperties(ogcFilters));
        }
        if ((this.dataSource as TimeFilterableDataSource).timeFilter$) {
            this.timeFilter$$ = (this.dataSource as TimeFilterableDataSource).timeFilter$
                .subscribe(timeFilter => this.transferTimeFilterProperties(timeFilter));
        }*/
/*
        this.map.ol.once('rendercomplete', () => {
            this.syncChildLayersFromRootParent();
        });*/
    }

    protected unwatch() {
        this.ol.un('propertychange', evt => this.transferCommonProperties(evt));
        if (this.ogcFilters$$) { this.ogcFilters$$.unsubscribe(); }
        if (this.timeFilter$$) { this.timeFilter$$.unsubscribe(); }
    }

    private getIgoLayerByLinkId(id: string) {
        return this.map.layers.find(l => l.options.linkedLayers?.linkId === id);
    }

    getDirectChildLayers(layer?: Layer): Layer[] {
        const layerToUse = layer? layer: this.layer;
        let linkedIds = [];
        if (layerToUse.options.linkedLayers.links) {
            layerToUse.options.linkedLayers.links.map(link => {
                linkedIds = linkedIds.concat(link.linkedIds)});
        }
        return linkedIds.map(lid => this.getIgoLayerByLinkId(lid));
    }

    getRootParent(layer?: Layer): Layer {
        let layerToUse = layer ? layer : this.layer;
        let parentLayer = layerToUse;
        let hasParentLayer = true;
        while (hasParentLayer) {
            layerToUse = parentLayer;
            parentLayer = this.getDirectParentLayer(layerToUse);
            hasParentLayer = parentLayer ? true : false;
        }
        return hasParentLayer ? parentLayer : layerToUse;
    }

    getDirectParentLayer(layer?: Layer): Layer {
        const layerToUse = layer? layer: this.layer;
        if (layerToUse.options.linkedLayers?.linkId) {
            const currentLinkId = layerToUse.options.linkedLayers.linkId;
            let parents =this.map.layers.filter(pl => pl.options.linkedLayers?.links?.some(l => l.linkedIds.includes(currentLinkId)));
            if (parents.length > 1) {
                console.warn(`Your layer ${layer.title || layer.id} must only have 1 parent (${parents.map(p => p.title || p.id)})
                , The first parent (${parents[0].title || parents[0].id}) will be use to sync properties`);
            }
            return parents[0];
        }
    }

    getAllChildLayers(layer: Layer, knownChildLayers: Layer[]): Layer[] {
        const layerToUse = layer ? layer : this.layer;
        let childLayers = this.getDirectChildLayers(layerToUse);
        childLayers.map(cl => {
            knownChildLayers.push(cl);
            const directChildLayers =  this.getDirectChildLayers(cl);
            if (directChildLayers) {
                this.getAllChildLayers(cl, knownChildLayers);
            }

        })
        return knownChildLayers;
    }


    private syncChildLayersFromRootParent() {
        // Force the sync the child layers with parent on the first load.
        if (!this.map) {
            return;
        }


       const linkedLayers = this.layer?.options.linkedLayers
        if (linkedLayers) {
            const rootParent =this.getRootParent();
            console.log('Moi, ',this.layer.title, 'mon parent est :', rootParent.title);     
            const knownChildLayers = [];
            const allChildLayers = this.getAllChildLayers(rootParent, knownChildLayers);
            console.log('Moi rootParent, ',rootParent.title, 'mes enfants sont :', allChildLayers.map(m => m.title));      
        }


/*
        if (this.layer?.options.linkedLayers?.links) {
            this.layer.options.linkedLayers.links.map(link => {
                if (link.properties?.indexOf(LinkedProperties.VISIBLE) !== -1) {
                    this.ol.notify(LinkedProperties.VISIBLE, !(this.layer.visible))
                }
                if (link.properties?.indexOf(LinkedProperties.OPACITY) !== -1) {
                    this.ol.notify(LinkedProperties.OPACITY, 0)
                }
                if (link.properties?.indexOf(LinkedProperties.MINRESOLUTION) !== -1) {
                    this.ol.notify(LinkedProperties.MINRESOLUTION, 0)
                }
                if (link.properties?.indexOf(LinkedProperties.MAXRESOLUTION) !== -1) {
                    this.ol.notify(LinkedProperties.MAXRESOLUTION, 0)
                }
                if (link.properties?.indexOf(LinkedProperties.OGCFILTERS) !== -1) {
                    const ogcFilters$ = (this.dataSource as OgcFilterableDataSource).ogcFilters$;
                    (this.dataSource as OgcFilterableDataSource).setOgcFilters(ogcFilters$.value, true)
                }
                if (link.properties?.indexOf(LinkedProperties.TIMEFILTER) !== -1) {
                    const timeFilter$ = (this.layer.dataSource as TimeFilterableDataSource).timeFilter$;
                    timeFilter$.next(timeFilter$.value);
                }
            });
        }*/
    }

    private transferCommonProperties(layerChange: ObjectEvent) {
        if (LinkedProperties.OGCFILTERS === layerChange.key) {
            console.log('comment yéyéyélsjkksjdj', layerChange, LinkedProperties[layerChange.key])
            this.transferOgcFiltersProperties(layerChange.target.get(layerChange.key));
            return;
        }

        if (![
            LinkedProperties.VISIBLE,
            LinkedProperties.OPACITY,
            LinkedProperties.MINRESOLUTION,
            LinkedProperties.MAXRESOLUTION]
            .includes(LinkedProperties[layerChange.key])) {
            return;
        }
        const key = layerChange.key;
        const layerChangeProperties = layerChange.target.getProperties();
        const newValue = layerChangeProperties[key];

        const linkedLayers = layerChangeProperties.linkedLayers as LayersLink;
        if (!linkedLayers) {
            return;
        }
        const currentLinkedId = linkedLayers.linkId;
        const currentLinks = linkedLayers.links;
        const isParentLayer = currentLinks ? true : false;

        if (isParentLayer) {
            // search for child layers
            const silent = true;
            currentLinks.map(link => {
                if (!link.properties || link.properties.indexOf(LinkedProperties[key]) === -1) {
                    return;
                }
                link.linkedIds.map(linkedId => {
                    const childLayer = this.getIgoLayerByLinkId(linkedId);
                    if (childLayer) {
                        childLayer.ol.set(key, newValue, silent);
                        if (key === 'visible') {
                            childLayer.visible$.next(newValue);
                        }
                    }
                });
            });
        } else {
            // search for parent layer
            const silent = false;
            const parentLayers = this.map.layers
                .filter(l => l.options.linkedLayers?.links)
            parentLayers.map(parentLayer => {
                    
                parentLayer.options.linkedLayers.links.map(l => {
                        if (l.properties && l.properties.indexOf(LinkedProperties[key]) !== -1 &&
                            l.bidirectionnal !== false && l.linkedIds.includes(currentLinkedId)) {
                            parentLayer.ol.set(key, newValue, silent);
                            if (key === 'visible') {
                                parentLayer.visible$.next(newValue);
                            }
                        }
                    });
            });
        }
    }

    private transferOgcFiltersProperties(ogcFilters) {
        const linkedLayers = this.ol.getProperties().linkedLayers as LayersLink;
        if (!linkedLayers) {
            return;
        }
        const currentLinkedId = linkedLayers.linkId;
        const layerSourceType = this.layer.options.source.options.type;
        const currentLinks = linkedLayers.links;
        const isParentLayer = currentLinks ? true : false;
        if (isParentLayer) {
            // search for child layers
            currentLinks.map(link => {
                if (!link.properties || link.properties.indexOf(LinkedProperties.OGCFILTERS) === -1) {
                    return;
                }
                link.linkedIds.map(linkedId => {
                    const layerToApply = this.getIgoLayerByLinkId(linkedId);
                    if (layerToApply) {
                        const layerType = layerToApply.options.source.options.type;
                        (layerToApply.dataSource as OgcFilterableDataSource).setOgcFilters(ogcFilters, false);
                        if (layerType === 'wfs') {
                            layerToApply.ol.getSource().refresh();
                        }
                        if (layerType === 'wms') {
                            let appliedOgcFilter;
                            if (layerSourceType === 'wfs') {
                                appliedOgcFilter = this.ogcFilterWriter.handleOgcFiltersAppliedValue(
                                    this.layer.dataSource.options as OgcFilterableDataSourceOptions,
                                    (this.dataSource.options as any).fieldNameGeometry,
                                    undefined,
                                    this.map.viewController.getOlProjection()
                                );
                            } else if (layerSourceType === 'wms') {
                                appliedOgcFilter = (this.dataSource as WMSDataSource).ol.getParams().FILTER;
                            }
                            (layerToApply.dataSource as WMSDataSource).ol.updateParams({ FILTER: appliedOgcFilter });
                        }
                    }
                });
            });
        } else {
            // search for parent layer
            this.map.layers.map(layer => {
                if (layer.options.linkedLayers?.links) {
                    layer.options.linkedLayers.links.map(l => {
                        if (l.properties && l.properties.indexOf(LinkedProperties.OGCFILTERS) !== -1 &&
                            l.bidirectionnal !== false && l.linkedIds.indexOf(currentLinkedId) !== -1) {
                            const layerType = layer.options.source.options.type;
                            if (layerType === 'wfs') {
                                (layer.dataSource as OgcFilterableDataSource).setOgcFilters(ogcFilters, true);
                                layer.ol.getSource().refresh();
                            }
                            if (layerType === 'wms') {
                                let appliedOgcFilter;
                                if (layerSourceType === 'wfs') {
                                    appliedOgcFilter = this.ogcFilterWriter.handleOgcFiltersAppliedValue(
                                        layer.dataSource.options as OgcFilterableDataSourceOptions,
                                        (this.dataSource.options as any).fieldNameGeometry,
                                        undefined,
                                        this.map.viewController.getOlProjection()
                                    );

                                } else if (layerSourceType === 'wms') {
                                    appliedOgcFilter = (this.dataSource as WMSDataSource).ol.getParams().FILTER;
                                }
                                (layer.dataSource as WMSDataSource).ol.updateParams({ FILTER: appliedOgcFilter });
                                (layer.dataSource as OgcFilterableDataSource).setOgcFilters(ogcFilters, true);
                            }
                        }
                    });
                }
            });
        }
    }

    private transferTimeFilterProperties(timeFilter) {
        const linkedLayers = this.ol.getProperties().linkedLayers as LayersLink;
        if (!linkedLayers) {
            return;
        }
        const currentLinkedId = linkedLayers.linkId;
        const currentLinks = linkedLayers.links;
        const isParentLayer = currentLinks ? true : false;
        if (isParentLayer) {
            // search for child layers
            currentLinks.map(link => {
                if (!link.properties || link.properties.indexOf(LinkedProperties.TIMEFILTER) === -1) {
                    return;
                }
                link.linkedIds.map(linkedId => {
                    const childLayer = this.map.layers.find(layer =>
                        layer.dataSource instanceof WMSDataSource &&
                        layer.options.linkedLayers?.linkId === linkedId);
                    if (childLayer) {
                        (childLayer.dataSource as TimeFilterableDataSource).setTimeFilter(timeFilter, false);
                        const appliedTimeFilter = (this.ol.getSource() as olSourceImageWMS).getParams().TIME;
                        (childLayer.dataSource as WMSDataSource).ol.updateParams({ TIME: appliedTimeFilter });
                    }
                });
            });
        } else {
            // search for parent layer
            this.map.layers
                .filter(layer => layer.dataSource instanceof WMSDataSource)
                .map(parentLayer => {
                    if (parentLayer.options.linkedLayers?.links) {
                        parentLayer.options.linkedLayers.links.map(l => {
                            if (l.properties && l.properties.indexOf(LinkedProperties.TIMEFILTER) !== -1 &&
                                l.bidirectionnal !== false && l.linkedIds.indexOf(currentLinkedId) !== -1) {
                                const appliedTimeFilter = (this.ol.getSource() as olSourceImageWMS).getParams().TIME;
                                (parentLayer.dataSource as WMSDataSource).ol.updateParams({ TIME: appliedTimeFilter });
                                (parentLayer.dataSource as TimeFilterableDataSource).setTimeFilter(timeFilter, true);
                            }
                        });
                    }
                });
        }
    }
}
