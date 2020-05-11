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

import { LayerOptions, LayersLink, ComputedLink } from './layer.interface';

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

  get id(): string {
    return this.options.id || this.dataSource.id;
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
    }
  }

  private observePropertiesChange() {
    if (!this.map) {
      return;
    }
    // not needed this.computeLayersRelation();
    this.ol.on('propertychange', evt => {
      this.transferCommonProperties(evt);
    });

    if ((this.dataSource as WMSDataSource).ogcFilters$) {
      (this.dataSource as WMSDataSource).ogcFilters$.subscribe(ogcFilters => console.log(ogcFilters));
    }

  }

  private transferCommonProperties(layerChange) {
    // TODO Sourcefields
    // Synced delete layer.
    const key = layerChange.key;
    const layerChangeProperties = layerChange.target.getProperties();
    const newValue = layerChangeProperties[key];
    if (key !== 'visible' &&  key !== 'opacity') {
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
      currentLinks.map(link => {
        if (!link.properties || link.properties.indexOf(key) === -1) {
          return;
        }
        link.linkedIds.map(linkedId => {
          const layerToApply = this.map.layers.find(layer => layer.options.linkedLayers && layer.options.linkedLayers.linkId === linkedId);
          if (layerToApply) {
            layerToApply.ol.set(key, newValue, true);
            if (key === 'visible') {
              layerToApply.visible$.next(newValue);
            }
          }
        });
      });
    } else {
      // search for parent layer
      this.map.layers.map(layer => {
        if (layer.options.linkedLayers && layer.options.linkedLayers.links) {
          layer.options.linkedLayers.links.map(l => {
            if (l.bidirectionnal !== false && l.linkedIds.indexOf(currentLinkedId) !== -1) {
              layer.ol.set(key, newValue, false);
              if (key === 'visible') {
                layer.visible$.next(newValue);
              }
            }
          });
        }
      });
    }
  }

  // private computeLayersRelation() {
  //   if (!this.map) { return; }
  //   this.map.status$
  //     .pipe(first())
  //     .subscribe(() => {
  //       const computedLinks = [];
  //       this.map.layers
  //         .filter(layer => layer.options.linkedLayers && layer.options.linkedLayers.links)
  //         .map(layer => {
  //           const srcId = layer.options.linkedLayers.linkId;
  //           layer.options.linkedLayers.links.map(link => {
  //             const bidirectionnal = link.bidirectionnal !== undefined ? link.bidirectionnal : true;
  //             link.linkedIds.map(linkedId => {
  //               computedLinks.push(
  //                 { srcId, dstId: linkedId, properties: link.properties, bidirectionnal, srcProcessed: undefined } as ComputedLink);
  //             });
  //           });
  //         });

  //       if (this.options.linkedLayers && this.options.linkedLayers.linkId) {
  //         const linkId = this.options.linkedLayers.linkId;
  //         this.options.linkedLayers.computedLinks =
  //           computedLinks.filter(computedLink => computedLink.srcId === linkId || computedLink.dstId === linkId);
  //       }
  //     });
  // }

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
