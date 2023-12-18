import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

import { EntityKey, EntityStore, EntityStoreWithStrategy } from '@igo2/common';
import { LanguageService, MessageService } from '@igo2/core';
import {
  ClusterDataSource,
  DataSourceService,
  Feature,
  FeatureMotion,
  IgoMap,
  Layer,
  LayerOptions,
  LayerService,
  MapViewOptions,
  MeasureLengthUnit,
  OSMDataSource,
  OSMDataSourceOptions,
  QueryableDataSource,
  QueryableDataSourceOptions,
  SpatialFilterItemType,
  SpatialFilterQueryType,
  SpatialFilterService,
  SpatialFilterThematic,
  SpatialFilterType,
  VectorLayer,
  createOverlayMarkerStyle,
  featureToOl,
  moveToOlFeatures
} from '@igo2/geo';
import { Coordinate } from 'ol/coordinate';

import olFormatGeoJSON from 'ol/format/GeoJSON';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import olSourceCluster from 'ol/source/Cluster';
import olSourceVector from 'ol/source/Vector';
import * as olstyle from 'ol/style';

import { Observable, Subject, forkJoin } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

/**
 * Spatial Filter Type
 */
@Component({
  selector: 'app-spatial-filter',
  templateUrl: './spatial-filter.component.html',
  styleUrls: ['./spatial-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSpatialFilterComponent implements OnInit, OnDestroy {
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 6
  };

  @Input() type: SpatialFilterType;
  @Input() itemType: SpatialFilterItemType = SpatialFilterItemType.Address;
  @Input() freehandDrawIsActive: boolean;

  public layers: Layer[] = [];
  public activeLayers: Layer[] = [];

  public queryType: SpatialFilterQueryType;
  public thematics: SpatialFilterThematic[];
  public zone: Feature;
  public zoneWithBuffer: Feature;
  public buffer: number = 0;

  public iterator: number = 1;

  public selectedFeature$: BehaviorSubject<Feature> = new BehaviorSubject(
    undefined
  );

  private format: olFormatGeoJSON = new olFormatGeoJSON();

  public store: EntityStoreWithStrategy = new EntityStoreWithStrategy<Feature>([]); // Store to print results at the end

  public spatialListStore: EntityStore<Feature> = new EntityStore<Feature>([]);

  public loading: boolean = false;

  public thematicLength: number = 0;

  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;
  private unsubscribe$ = new Subject<void>();

  public defaultStyle: olstyle.Style | ((feature, resolution) => olstyle.Style);

  constructor(
    private matIconRegistry: MatIconRegistry,
    private spatialFilterService: SpatialFilterService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private messageService: MessageService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      } as OSMDataSourceOptions)
      .subscribe((dataSource: OSMDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            baseLayer: true,
            visible: true
          } as LayerOptions)
        );
      });
  }

  ngOnInit(): void {
    for (const layer of this.map.layers) {
      if (
        layer.title &&
        layer.title.includes(
          this.languageService.translate.instant(
            'igo.geo.spatialFilter.spatialFilter'
          )
        )
      ) {
        this.layers.push(layer);
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getOutputType(event: SpatialFilterType): void {
    this.type = event;
    this.queryType = undefined;
  }

  getOutputQueryType(event: SpatialFilterQueryType): void {
    this.queryType = event;
    if (this.queryType) {
      this.loadFilterList();
    }
  }

  private loadFilterList(): void {
    this.spatialFilterService
      .loadFilterList(this.queryType)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((features: Feature[]) => {
        features.sort((a, b) => {
          if (a.properties.nom < b.properties.nom) {
            return -1;
          }
          if (a.properties.nom > b.properties.nom) {
            return 1;
          }
          return 0;
        });
        this.spatialListStore.clear();
        this.spatialListStore.load(features);
      });
  }

  getOutputToggleSearch(): void {
    this.loadThematics();
  }

  getOutputClearSearch(): void {
    this.zone = undefined;
    this.queryType = undefined;
  }

  clearMap(): void {
    this.map.removeLayers(this.layers);
    this.layers = [];
    this.activeLayers = [];
    this.thematicLength = 0;
    this.iterator = 1;
    if (this.type === SpatialFilterType.Predefined) {
      this.zone = undefined;
      this.queryType = undefined;
    }
  }

  private loadThematics(): void {
    this.loading = true;
    let zeroResults: boolean = true;
    let thematics: SpatialFilterThematic[];
    if (this.buffer === 0 || this.type === SpatialFilterType.Point) {
      this.tryAddFeaturesToMap([this.zone]);
    }
    if (this.itemType !== SpatialFilterItemType.Thematics) {
      const theme: SpatialFilterThematic = {
        name: ''
      };
      thematics = [theme];
    } else {
      thematics = this.thematics;
    }
    if (
      this.measureUnit === MeasureLengthUnit.Kilometers &&
      this.type !== SpatialFilterType.Point
    ) {
      this.buffer = this.buffer * 1000;
    }
    if (this.type === SpatialFilterType.Polygon) {
      this.buffer = 0; // to avoid buffer enter a second time in terrAPI
    }

    const observables$: Observable<Feature[]>[] = [];
    thematics.forEach((thematic: SpatialFilterThematic) => {
      observables$.push(
        this.spatialFilterService
          .loadFilterItem(
            this.zone,
            this.itemType,
            this.queryType,
            thematic,
            this.buffer
          )
          .pipe(
            tap((features: Feature[]) => {
              this.store.insertMany(features);
              const featuresPoint: Feature[] = [];
              const featuresLinePoly: Feature[] = [];
              let idPoint: EntityKey;
              let idLinePoly: EntityKey;
              features.forEach((feature: Feature) => {
                if (feature.geometry.type === SpatialFilterType.Point) {
                  feature.properties.longitude =
                    feature.geometry.coordinates[0];
                  feature.properties.latitude = feature.geometry.coordinates[1];
                  featuresPoint.push(feature);
                  idPoint = feature.meta.id;
                } else {
                  featuresLinePoly.push(feature);
                  idLinePoly = feature.meta.id;
                }
              });

              this.tryAddPointToMap(featuresPoint, idPoint);
              this.tryAddLayerToMap(featuresLinePoly, idLinePoly);
              if (features.length) {
                zeroResults = false;
                this.thematicLength += 1;
                thematic.zeroResults = false;
                this.cdRef.detectChanges();
              } else {
                thematic.zeroResults = true;
              }

              if (features.length >= 10000) {
                this.messageService.alert(
                  'igo.geo.spatialFilter.maxSizeAlert',
                  'igo.geo.spatialFilter.warning',
                  { timeOut: 10000 }
                );
              }
            })
          )
      );
    });

    forkJoin(observables$)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.loading = false;
        if (zeroResults) {
          this.messageService.alert(
            'igo.geo.spatialFilter.zeroResults',
            'igo.geo.spatialFilter.warning',
            { timeOut: 10000 }
          );
        }
      });
  }

  onZoneChange(feature: Feature, buffer?: boolean): void {
    this.zone = feature;
    if (feature) {
      buffer
        ? this.tryAddFeaturesToMap([feature], true)
        : this.tryAddFeaturesToMap([feature]);
      this.zoomToFeatureExtent(feature);
    }
  }

  /**
   * Try to add zone feature to the map overlay
   */
  public tryAddFeaturesToMap(features: Feature[], buffer?: boolean): void {
    let i: number = 1;
    for (const feature of features) {
      if (this.type === SpatialFilterType.Predefined) {
        for (const layer of this.layers) {
          if (
            layer.options._internal &&
            layer.options._internal.code === feature.properties.code &&
            !buffer
          ) {
            if (!layer.title?.startsWith('Zone')) {
              const index: number = this.layers.indexOf(layer);
              this.layers.splice(index, 1);
            }
            return;
          }
          if (layer.title?.startsWith('Zone')) {
            this.activeLayers = [];
            const index: number = this.layers.indexOf(layer);
            this.layers.splice(index, 1);
            this.map.removeLayer(layer);
          }
        }
      } else {
        if (buffer) {
          for (const layer of this.activeLayers) {
            if (
              this.activeLayers.length === 1 &&
              layer.title?.startsWith('Zone')
            ) {
              const index: number = this.layers.indexOf(layer);
              this.layers.splice(index, 1);
              this.map.removeLayer(layer);
            }
          }
        }
        this.activeLayers = [];
      }
      for (const layer of this.layers) {
        if (layer.title?.startsWith('Zone')) {
          i++;
        }
      }
      this.defaultStyle = (_feature, resolution) => {
        const coordinates: Coordinate = (features[0] as any).coordinates;
        return new olstyle.Style({
          image: new olstyle.Circle({
            radius: coordinates
              ? this.buffer /
                Math.cos((Math.PI / 180) * coordinates[1]) /
                resolution
              : undefined,
            fill: new olstyle.Fill({
              color: 'rgba(200, 200, 20, 0.2)'
            }),
            stroke: new olstyle.Stroke({
              width: 1,
              color: 'orange'
            })
          }),
          stroke: new olstyle.Stroke({
            width: 1,
            color: 'orange'
          }),
          fill: new olstyle.Fill({
            color: 'rgba(200, 200, 20, 0.2)'
          })
        });
      };
      this.dataSourceService
        .createAsyncDataSource({
          type: 'vector',
          queryable: true
        } as QueryableDataSourceOptions)
        .pipe(take(1))
        .subscribe((dataSource: QueryableDataSource) => {
          const olLayer: VectorLayer = this.layerService.createLayer({
            isIgoInternalLayer: true,
            title: ('Zone ' +
              i +
              ' - ' +
              this.languageService.translate.instant(
                'igo.geo.spatialFilter.spatialFilter'
              )) as string,
            workspace: { enabled: true },
            _internal: {
              code:
                this.type === SpatialFilterType.Predefined
                  ? feature.properties.code
                  : undefined
            },
            source: dataSource,
            visible: true
          }) as VectorLayer;
          const featuresOl = features.map((feature: Feature) => {
            return featureToOl(feature, this.map.projectionCode);
          });
          if (this.type !== SpatialFilterType.Predefined) {
            const type =
              this.type === SpatialFilterType.Point ? 'Cercle' : 'Polygone';
            featuresOl[0].set('nom', 'Zone', true);
            featuresOl[0].set('type', type, true);
          }
          const ol = dataSource.ol as
            | olSourceVector<OlGeometry>
            | olSourceCluster;
          ol.addFeatures(featuresOl);
          olLayer.ol.setStyle(this.defaultStyle);
          this.map.addLayer(olLayer);
          this.layers.push(olLayer);
          this.activeLayers.push(olLayer);
          this.cdRef.detectChanges();
        });
    }
  }

  /**
   * Try to add point features to the map
   * Necessary to create clusters
   */
  private tryAddPointToMap(features: Feature[], id: EntityKey): void {
    let i: number = 1;
    if (features.length) {
      if (this.map === undefined) {
        return;
      }
      for (const layer of this.layers) {
        if (layer.title?.startsWith(features[0].meta.title)) {
          i++;
        }
      }
      this.dataSourceService
        .createAsyncDataSource({
          type: 'cluster',
          id,
          queryable: true,
          distance: 120,
          meta: {
            title: 'Cluster'
          }
        } as QueryableDataSourceOptions)
        .pipe(take(1))
        .subscribe((dataSource: ClusterDataSource) => {
          const icon: string = features[0].meta.icon;
          let style: olstyle.Style;
          if (!icon) {
            style = createOverlayMarkerStyle();
          } else {
            style = this.createSvgIcon(icon) || createOverlayMarkerStyle();
          }

          const olLayer: Layer = this.layerService.createLayer({
            isIgoInternalLayer: true,
            title: (features[0].meta.title +
              ' ' +
              i +
              ' - ' +
              this.languageService.translate.instant(
                'igo.geo.spatialFilter.spatialFilter'
              )) as string,
            source: dataSource,
            visible: true,
            style
          });

          const featuresOl = features.map((feature: Feature) => {
            return featureToOl(feature, this.map.projectionCode);
          });
          const ol: olSourceCluster = dataSource.ol;
          ol.getSource().addFeatures(featuresOl);
          if (this.layers.find((layer: Layer) => layer.id === olLayer.id)) {
            this.map.removeLayer(
              this.layers.find((layer: Layer) => layer.id === olLayer.id)
            );
            i = i - 1;
            olLayer.title = (features[0].meta.title +
              ' ' +
              i +
              ' - ' +
              this.languageService.translate.instant(
                'igo.geo.spatialFilter.spatialFilter'
              )) as string;
            olLayer.options.title = olLayer.title;
          }
          this.iterator = i;
          this.map.addLayer(olLayer);
          this.layers.push(olLayer);
          this.pushLayer(olLayer);
          this.cdRef.detectChanges();
        });
    }
  }

  private createSvgIcon(icon: string): olstyle.Style {
    let style: olstyle.Style;
    this.matIconRegistry.getNamedSvgIcon(icon).subscribe((svgObj: SVGElement) => {
      const xmlSerializer: XMLSerializer = new XMLSerializer();
      svgObj.setAttribute('width', '30');
      svgObj.setAttribute('height', '30');
      svgObj.setAttribute('fill', 'rgba(0, 128, 255)');
      svgObj.setAttribute('stroke', 'white');
      const svg: string = xmlSerializer.serializeToString(svgObj);
      style = new olstyle.Style({
        image: new olstyle.Icon({
          src: 'data:image/svg+xml;utf8,' + svg
        })
      });
    });
    return style;
  }
  /**
   * Try to add line or polygon features to the map
   */
  private tryAddLayerToMap(features: Feature[], id: EntityKey): void {
    let i: number = 1;
    if (features.length) {
      if (this.map === undefined) {
        return;
      }
      for (const layer of this.layers) {
        if (layer.title?.startsWith(features[0].meta.title)) {
          i++;
        }
      }
      this.dataSourceService
        .createAsyncDataSource({
          type: 'vector',
          id,
          queryable: true
        } as QueryableDataSourceOptions)
        .pipe(take(1))
        .subscribe((dataSource: QueryableDataSource) => {
          const olLayer: Layer = this.layerService.createLayer({
            isIgoInternalLayer: true,
            title: (features[0].meta.title +
              ' ' +
              i +
              ' - ' +
              this.languageService.translate.instant(
                'igo.geo.spatialFilter.spatialFilter'
              )) as string,
            source: dataSource,
            visible: true
          });
          const featuresOl = features.map((feature: Feature) => {
            return featureToOl(feature, this.map.projectionCode);
          });
          const ol = dataSource.ol as olSourceVector<OlGeometry>;
          ol.addFeatures(featuresOl);
          if (this.layers.find((layer: Layer) => layer.id === olLayer.id)) {
            this.map.removeLayer(
              this.layers.find((layer: Layer) => layer.id === olLayer.id)
            );
            i = i - 1;
            olLayer.title = (features[0].meta.title +
              ' ' +
              i +
              ' - ' +
              this.languageService.translate.instant(
                'igo.geo.spatialFilter.spatialFilter'
              )) as string;
            olLayer.options.title = olLayer.title;
          }
          this.map.addLayer(olLayer);
          this.layers.push(olLayer);
          this.pushLayer(olLayer);
          this.cdRef.detectChanges();
        });
    }
  }

  zoomToFeatureExtent(feature: Feature): void {
    if (feature) {
      const olFeature = this.format.readFeature(feature, {
        dataProjection: feature.projection,
        featureProjection: this.map.projectionCode
      });
      moveToOlFeatures(
        this.map.viewController,
        [olFeature],
        FeatureMotion.Zoom
      );
    }
  }

  pushLayer(layer: Layer): void {
    for (const activeLayer of this.activeLayers) {
      if (activeLayer.id === layer.id) {
        return;
      }
    }

    this.activeLayers.push(layer);
  }
}
