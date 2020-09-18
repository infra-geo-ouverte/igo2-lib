import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  combineLatest
} from 'rxjs';
import { map, first } from 'rxjs/operators';

import olLayer from 'ol/layer/Layer';

import { AuthInterceptor } from '@igo2/auth';
import { SubjectStatus } from '@igo2/utils';

import { DataSource, Legend, WMSDataSource } from '../../../datasource';
import { IgoMap } from '../../../map/shared/map';
import { getResolutionFromScale } from '../../../map/shared/map.utils';

import { LayerOptions, LayersLink } from './layer.interface';
import { OgcFilterableDataSource, OgcFilterableDataSourceOptions } from '../../../filter/shared/ogc-filter.interface';
import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';

export abstract class Layer {
  public collapsed: boolean;
  public dataSource: DataSource;
  public legend: Legend[];
  public legendCollapsed: boolean = true;
  public firstLoadComponent: boolean = true;
  public map: IgoMap;
  public ol: olLayer;
  public status$: Subject<SubjectStatus>;

  private resolution$$: Subscription;
  private ogcFilterWriter;

  get id(): string {
    return this.options.id || this.dataSource.id;
  }

  get alias(): string {
    return this.options.alias;
  }

  get title(): string {
    return this.options.title;
  }

  set title(title: string) {
    this.options.title = title;
  }

  get zIndex(): number {
    return this.ol.getZIndex();
  }

  set zIndex(zIndex: number) {
    this.ol.setZIndex(zIndex);
  }

  get baseLayer(): boolean {
    return this.options.baseLayer;
  }

  set baseLayer(baseLayer: boolean) {
    this.options.baseLayer = baseLayer;
  }

  get opacity(): number {
    return this.ol.get('opacity');
  }

  set opacity(opacity: number) {
    this.ol.setOpacity(opacity);
  }

  set isInResolutionsRange(value: boolean) {
    this.isInResolutionsRange$.next(value);
  }
  get isInResolutionsRange(): boolean {
    return this.isInResolutionsRange$.value;
  }
  readonly isInResolutionsRange$: BehaviorSubject<
    boolean
  > = new BehaviorSubject(false);

  set maxResolution(value: number) {
    this.ol.setMaxResolution(value || Infinity);
    this.updateInResolutionsRange();
  }
  get maxResolution(): number {
    return this.ol.getMaxResolution();
  }

  set minResolution(value: number) {
    this.ol.setMinResolution(value || 0);
    this.updateInResolutionsRange();
  }
  get minResolution(): number {
    return this.ol.getMinResolution();
  }

  set visible(value: boolean) {
    this.ol.setVisible(value);
    this.visible$.next(value);
  }
  get visible(): boolean {
    return this.visible$.value;
  }
  readonly visible$: BehaviorSubject<boolean> = new BehaviorSubject(undefined);

  get displayed(): boolean {
    return this.visible && this.isInResolutionsRange;
  }
  readonly displayed$: Observable<boolean> = combineLatest([
    this.isInResolutionsRange$,
    this.visible$
  ]).pipe(map((bunch: [boolean, boolean]) => bunch[0] && bunch[1]));

  get showInLayerList(): boolean {
    return this.options.showInLayerList !== false;
  }

  constructor(
    public options: LayerOptions,
    protected authInterceptor?: AuthInterceptor
  ) {
    this.ogcFilterWriter = new OgcFilterWriter();
    this.dataSource = options.source;

    this.ol = this.createOlLayer();
    if (options.zIndex !== undefined) {
      this.zIndex = options.zIndex;
    }

    if (options.baseLayer && options.visible === undefined) {
      options.visible = false;
    }

    this.maxResolution = options.maxResolution || getResolutionFromScale(Number(options.maxScaleDenom));
    this.minResolution = options.minResolution || getResolutionFromScale(Number(options.minScaleDenom));

    this.visible = options.visible === undefined ? true : options.visible;
    this.opacity = options.opacity === undefined ? 1 : options.opacity;

    if (
      options.legendOptions &&
      (options.legendOptions.url || options.legendOptions.html)
    ) {
      this.legend = this.dataSource.setLegend(options.legendOptions);
    }

    this.legendCollapsed = options.legendOptions
      ? options.legendOptions.collapsed
        ? options.legendOptions.collapsed
        : true
      : true;

    this.ol.set('_layer', this, true);
  }

  protected abstract createOlLayer(): olLayer;

  setMap(igoMap: IgoMap | undefined) {
    this.map = igoMap;

    this.unobserveResolution();
    if (igoMap !== undefined) {
      this.observeResolution();
      this.observePropertiesChange();
      this.syncChildLayers();
    }
  }

  private syncChildLayers() {
    // Force the sync the child layers with parent on the first load.
    if (!this.map) {
      return;
    }
    this.map.status$
      .pipe(first())
      .subscribe(() => {
        this.map.layers
          .filter(layer => layer.options.linkedLayers?.links)
          .map(layer => {
            layer.options.linkedLayers.links.map(link => {
              if (link.properties?.indexOf('visible') !== -1) {
                layer.ol.set('visible', !(layer.visible), false);
                layer.ol.set('visible', !(layer.visible), false);
                layer.visible = layer.visible;
              }
              if (link.properties?.indexOf('opacity') !== -1) {
                const baseOpacity = layer.ol.get('opacity');
                layer.ol.set('opacity', 0, false);
                layer.ol.set('opacity', baseOpacity, false);
                layer.opacity = layer.opacity;
              }
              if (link.properties?.indexOf('minResolution') !== -1) {
                const baseMinResolution = layer.ol.get('minResolution');
                layer.ol.set('minResolution', 0, false);
                layer.ol.set('minResolution', baseMinResolution, false);
                layer.minResolution = layer.minResolution;
              }
              if (link.properties?.indexOf('maxResolution') !== -1) {
                const baseMaxResolution = layer.ol.get('maxResolution');
                layer.ol.set('maxResolution', 0, false);
                layer.ol.set('maxResolution', baseMaxResolution, false);
                layer.minResolution = layer.minResolution;
              }
              if (link.properties?.indexOf('ogcFilters') !== -1) {
                const ogcFilters$ = (layer.dataSource as OgcFilterableDataSource).ogcFilters$;
                ogcFilters$.next(ogcFilters$.value);
              }
            });
          });
      });
  }

  private observePropertiesChange() {
    if (!this.map) {
      return;
    }
    this.ol.on('propertychange', evt => {
      this.transferCommonProperties(evt);
    });

    if ((this.dataSource as OgcFilterableDataSource).ogcFilters$) {
      (this.dataSource as OgcFilterableDataSource).ogcFilters$
        .subscribe(ogcFilters => this.transferOgcFiltersProperties(ogcFilters));
    }

  }

  private transferOgcFiltersProperties(ogcFilters) {
    // TODO timefilter
    // TODO Synced delete layer.

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
        if (!link.properties || link.properties.indexOf('ogcFilters') === -1) {
          return;
        }
        link.linkedIds.map(linkedId => {
          const layerToApply = this.map.layers.find(layer => layer.options.linkedLayers?.linkId === linkedId);
          if (layerToApply) {
            const layerType = layerToApply.ol.getProperties().sourceOptions.type;
            (layerToApply.dataSource as OgcFilterableDataSource).setOgcFilters(ogcFilters, false);
            if (layerType === 'wfs') {
              layerToApply.ol.getSource().clear();
            }
            if (layerType === 'wms') {
              if (this.ol.getProperties().sourceOptions.type === 'wfs') {
                console.log('this', this);
              }
              const appliedOgcFilter = this.ol.values_.sourceOptions.params.FILTER;
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
            if (l.properties && l.properties.indexOf('ogcFilters') !== -1 &&
              l.bidirectionnal !== false && l.linkedIds.indexOf(currentLinkedId) !== -1) {
              const layerType = layer.ol.getProperties().sourceOptions.type;
              if (layerType === 'wfs') {
                (layer.dataSource as OgcFilterableDataSource).setOgcFilters(ogcFilters, true);
                layer.ol.getSource().clear();
              }
              if (layerType === 'wms') {
                let appliedOgcFilter = this.ol.values_.sourceOptions.params.FILTER;
                if (this.ol.getProperties().sourceOptions.type === 'wfs') {
                  appliedOgcFilter = this.ogcFilterWriter.handleOgcFiltersAppliedValue(
                    layer.dataSource.options as OgcFilterableDataSourceOptions,
                    (this.dataSource.options as any).fieldNameGeometry,
                    this.map.viewController.getExtent(),
                    this.map.viewController.getOlProjection()
                  );

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
  private transferCommonProperties(layerChange) {
    const key = layerChange.key;
    const layerChangeProperties = layerChange.target.getProperties();
    const newValue = layerChangeProperties[key];
    const oldValue = layerChange.oldValue;

    if (['visible', 'opacity', 'minResolution', 'maxResolution'].indexOf(key) === -1) {
      return;
    }
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
        if (!link.properties || link.properties.indexOf(key) === -1) {
          return;
        }
        link.linkedIds.map(linkedId => {
          const layerToApply = this.map.layers.find(layer => layer.options.linkedLayers?.linkId === linkedId);
          if (layerToApply) {
            layerToApply.ol.set(key, newValue, silent);
            if (key === 'visible') {
              layerToApply.visible$.next(newValue);
            }
          }
        });
      });
    } else {
      // search for parent layer
      const silent = false;
      this.map.layers.map(layer => {
        if (layer.options.linkedLayers?.links) {
          layer.options.linkedLayers.links.map(l => {
            if (l.properties && l.properties.indexOf(key) !== -1 &&
              l.bidirectionnal !== false && l.linkedIds.indexOf(currentLinkedId) !== -1) {
                layer.ol.set(key, newValue, silent);
                if (key === 'visible') {
                  layer.visible$.next(newValue);
                }
            }
          });
        }
      });
    }
  }

  private observeResolution() {
    this.resolution$$ = this.map.viewController.resolution$.subscribe(() =>
      this.updateInResolutionsRange()
    );
  }

  private unobserveResolution() {
    if (this.resolution$$ !== undefined) {
      this.resolution$$.unsubscribe();
      this.resolution$$ = undefined;
    }
  }

  private updateInResolutionsRange() {
    if (this.map !== undefined) {
      const resolution = this.map.viewController.getResolution();
      const minResolution = this.minResolution;
      const maxResolution = this.maxResolution === undefined ? Infinity : this.maxResolution;
      this.isInResolutionsRange = resolution >= minResolution && resolution <= maxResolution;
    } else {
      this.isInResolutionsRange = false;
    }
  }
}
