import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { EntityKey, EntityStore } from '@igo2/common/entity';
import { PanelComponent } from '@igo2/common/panel';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import {
  DataSourceService,
  FEATURE_DETAILS_DIRECTIVES,
  FILTER_DIRECTIVES,
  Feature,
  FeatureMotion,
  IgoMap,
  IgoQueryModule,
  Layer,
  LayerOptions,
  LayerService,
  MAP_DIRECTIVES,
  MapViewOptions,
  MeasureLengthUnit,
  OSMDataSource,
  OSMDataSourceOptions,
  QueryableDataSourceOptions,
  SpatialFilterItemType,
  SpatialFilterQueryType,
  SpatialFilterService,
  SpatialFilterThematic,
  SpatialFilterType,
  VectorLayer,
  VectorLayerOptions,
  createOverlayMarkerStyle,
  featureToOl,
  isLayerGroup,
  isLayerItem,
  moveToOlFeatures
} from '@igo2/geo';

import OlFeature from 'ol/Feature';
import olFormatGeoJSON from 'ol/format/GeoJSON';
import olSourceCluster from 'ol/source/Cluster';
import olSourceVector from 'ol/source/Vector';
import * as olstyle from 'ol/style';

import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

/**
 * Spatial Filter Type
 */
@Component({
  selector: 'app-spatial-filter',
  templateUrl: './spatial-filter.component.html',
  styleUrls: ['./spatial-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatGridListModule,
    MAP_DIRECTIVES,
    IgoQueryModule,
    PanelComponent,
    FILTER_DIRECTIVES,
    FEATURE_DETAILS_DIRECTIVES,
    AsyncPipe
  ]
})
export class AppSpatialFilterComponent implements OnInit, OnDestroy {
  // private matIconRegistry = inject(MatIconRegistry);
  private spatialFilterService = inject(SpatialFilterService);
  private dataSourceService = inject(DataSourceService);
  private layerService = inject(LayerService);
  private messageService = inject(MessageService);
  private languageService = inject(LanguageService);
  private cdRef = inject(ChangeDetectorRef);

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

  type = signal<SpatialFilterType>(undefined);
  itemType = signal<SpatialFilterItemType>(SpatialFilterItemType.Thematics);
  freehandDrawIsActive = signal<boolean>(undefined);

  public layers: Layer[] = [];
  public activeLayers: Layer[] = [];

  public queryType: SpatialFilterQueryType;
  public thematics: SpatialFilterThematic[];
  public zones: Feature[] = [];
  public zonesWithBuffer: Feature[] = [];
  public buffer: number = 0;

  public iterator = 1;

  public selectedFeature$ = new BehaviorSubject<Feature>(undefined);

  private format: olFormatGeoJSON = new olFormatGeoJSON();

  public store: EntityStore = new EntityStore<Feature>([]); // Store to print results at the end

  public spatialListStore: EntityStore<Feature> = new EntityStore<Feature>([]);

  public loading = false;

  public thematicLength = 0;

  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;
  private unsubscribe$ = new Subject<void>();
  private activePredefinedLayerZones: VectorLayer;
  private activeDrawLayerZones: VectorLayer;

  public defaultStyle: olstyle.Style | ((feature, resolution) => olstyle.Style);

  constructor() {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      } satisfies OSMDataSourceOptions)
      .subscribe((dataSource: OSMDataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            baseLayer: true,
            visible: true
          } satisfies LayerOptions)
        );
      });
  }

  ngOnInit(): void {
    for (const layer of this.map.layerController.all) {
      if (isLayerGroup(layer)) {
        return;
      }
      if (
        layer.title &&
        layer.title.includes(
          this.languageService.translate.instant(
            'igo.geo.spatialFilter.spatialFilter'
          )
        ) &&
        isLayerItem(layer)
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
    this.type.set(event);
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
    this.zones = [];
    this.queryType = undefined;
  }

  clearMap(): void {
    this.map.layerController.remove(...this.layers);
    this.layers = [];
    this.activeLayers = [];
    this.thematicLength = 0;
    this.iterator = 1;
    if (this.type() === SpatialFilterType.Predefined) {
      this.zones = [];
      this.queryType = undefined;
    }
  }

  private loadThematics(): void {
    this.loading = true;
    let zeroResults = true;
    let thematics: SpatialFilterThematic[];
    const type = this.type();
    if (this.buffer === 0 || type === SpatialFilterType.Point) {
      this.addFeaturesToMap(this.zones);
    }
    if (this.itemType() !== SpatialFilterItemType.Thematics) {
      const theme: SpatialFilterThematic = {
        name: ''
      };
      thematics = [theme];
    } else {
      thematics = this.thematics;
    }
    if (
      this.measureUnit === MeasureLengthUnit.Kilometers &&
      type !== SpatialFilterType.Point
    ) {
      this.buffer = this.buffer * 1000;
    }
    if (type === SpatialFilterType.Polygon) {
      this.buffer = 0; // to avoid buffer enter a second time in terrAPI
    }

    this.spatialFilterService
      .loadFilterItems(this.zones, this.itemType(), {
        type: this.queryType,
        thematics,
        buffer: this.buffer
      })
      .pipe(
        tap((features: Feature[]) => {
          this.store.insertMany(features);
          const grouped = this.getFeatureByType(features);

          grouped.forEach(({ points, lines }) => {
            if (points.length > 0) {
              this.tryAddPointToMap(points, points[0].meta.id);
            }
            if (lines.length > 0) {
              this.tryAddLayerToMap(lines, lines[0].meta.id);
            }
          });

          thematics.forEach((thematic) => {
            const hasFeatures = features.some(
              (f) => f.properties.type === thematic.source
            );
            if (hasFeatures) {
              zeroResults = false;
              this.thematicLength += 1;
              thematic.zeroResults = zeroResults;
            } else {
              thematic.zeroResults = true;
            }
          });
          this.cdRef.detectChanges();

          if (features.length >= 10000) {
            this.messageService.alert(
              'igo.geo.spatialFilter.maxSizeAlert',
              'igo.geo.spatialFilter.warning',
              { timeOut: 10000 }
            );
          }
        })
      )
      .subscribe(() => {
        if (type !== SpatialFilterType.Predefined) {
          this.zones = [];
        }
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

  private getFeatureByType(features: Feature[]) {
    return features.reduce((grouped, feature) => {
      const typeKey = feature.properties.type;
      let group = grouped.get(typeKey);
      if (!group) {
        group = { points: [], lines: [] };
        grouped.set(typeKey, group);
      }

      if (feature.geometry.type === 'Point') {
        feature.properties.longitude = feature.geometry.coordinates[0];
        feature.properties.latitude = feature.geometry.coordinates[1];
        group.points.push(feature);
      } else {
        group.lines.push(feature);
      }
      return grouped;
    }, new Map<string, { points: Feature[]; lines: Feature[] }>());
  }

  /**
   * Try to add point features to the map
   * Necessary to create clusters
   */
  private tryAddPointToMap(features: Feature[], id: EntityKey): void {
    const activeZone =
      this.type() === SpatialFilterType.Predefined
        ? this.activePredefinedLayerZones
        : this.activeDrawLayerZones;
    let zoneIndex = 1;
    if (activeZone?.title) {
      const match = activeZone.title.match(/^Zone (\d+) -/);
      if (match) {
        zoneIndex = parseInt(match[1], 10);
      }
    }
    const titleFeature = features[0].meta.title;

    let i = 1;
    for (const layer of this.layers) {
      if (layer.title?.startsWith(titleFeature)) {
        i++;
      }
    }

    const style = createOverlayMarkerStyle();

    const filterLabel = this.languageService.translate.instant(
      'igo.geo.spatialFilter.spatialFilter'
    );

    const options: VectorLayerOptions = {
      isIgoInternalLayer: true,
      title: `${titleFeature} ${zoneIndex} - ${filterLabel}`,
      visible: true,
      style,

      sourceOptions: {
        type: 'cluster',
        id,
        queryable: true,
        distance: 120,
        meta: {
          title: 'Cluster'
        }
      } as QueryableDataSourceOptions
    };

    this.layerService
      .createAsyncLayer(options)
      .pipe(take(1))
      .subscribe((layer: VectorLayer) => {
        const featuresOl = features.map((feature) => {
          return featureToOl(feature, this.map.projection);
        });
        const ol = layer.dataSource.ol as olSourceCluster;
        ol.getSource().addFeatures(featuresOl);
        const previousLayer = this.layers.find(
          (prevLayer) => prevLayer.id === layer.id
        );
        if (previousLayer) {
          this.map.layerController.remove(previousLayer);
          i = i - 1;
          layer.title = `${titleFeature} ${zoneIndex} - ${filterLabel}`;
          layer.options.title = layer.title;
        }
        this.iterator = i;
        this.map.layerController.add(layer);
        this.layers.push(layer);
        this.pushLayer(layer);
      });
  }

  /**
   * Try to add line or polygon features to the map
   */
  private tryAddLayerToMap(features: Feature[], id: EntityKey): void {
    let i = 1;
    if (features.length) {
      if (this.map === undefined) {
        return;
      }
      for (const layer of this.layers) {
        if (layer.title?.startsWith(features[0].meta.title)) {
          i++;
        }
      }

      const options: VectorLayerOptions = {
        isIgoInternalLayer: true,
        title: (features[0].meta.title +
          ' ' +
          i +
          ' - ' +
          this.languageService.translate.instant(
            'igo.geo.spatialFilter.spatialFilter'
          )) as string,
        sourceOptions: {
          type: 'vector',
          id,
          queryable: true
        } as QueryableDataSourceOptions,
        visible: true
      };
      this.layerService
        .createAsyncLayer(options)
        .pipe(take(1))
        .subscribe((layer: VectorLayer) => {
          const featuresOl = features.map((feature) => {
            return featureToOl(feature, this.map.projection);
          });
          const ol = layer.dataSource.ol;
          ol.addFeatures(featuresOl);
          const previousLayer = this.layers.find(
            (prevLayer) => prevLayer.id === layer.id
          );
          if (previousLayer) {
            this.map.layerController.remove(previousLayer);
            i = i - 1;
            layer.title = (features[0].meta.title +
              ' ' +
              i +
              ' - ' +
              this.languageService.translate.instant(
                'igo.geo.spatialFilter.spatialFilter'
              )) as string;
            layer.options.title = layer.title;
          }
          this.map.layerController.add(layer);
          this.layers.push(layer);
          this.pushLayer(layer);
        });
    }
  }

  private findLastZoneIndex(): number {
    let max = 0;
    for (const layer of this.layers) {
      if (layer.title?.startsWith('Zone')) {
        const match = layer.title.match(/^Zone (\d+) -/);
        if (match) {
          const index = parseInt(match[1], 10);
          if (index > max) max = index;
        }
      }
    }
    return max;
  }

  private createZoneStyle(feature: Feature): (f, r) => olstyle.Style {
    return (_feature, resolution) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coordinates = (feature as any).coordinates;
      return new olstyle.Style({
        image: new olstyle.Circle({
          radius: coordinates
            ? this.buffer /
              Math.cos((Math.PI / 180) * coordinates[1]) /
              resolution
            : undefined,
          fill: new olstyle.Fill({ color: 'rgba(200, 200, 20, 0.2)' }),
          stroke: new olstyle.Stroke({ width: 1, color: 'orange' })
        }),
        stroke: new olstyle.Stroke({ width: 1, color: 'orange' }),
        fill: new olstyle.Fill({ color: 'rgba(200, 200, 20, 0.2)' })
      });
    };
  }

  private addFeaturesToMap(features: Feature[], buffer?: boolean) {
    const lastZoneIndex = this.findLastZoneIndex();
    const zoneLayer =
      this.type() === SpatialFilterType.Predefined
        ? this.activePredefinedLayerZones
        : undefined;
    if (!zoneLayer) {
      this.defaultStyle = this.createZoneStyle(features[0]);
      this.createZoneLayer(lastZoneIndex + 1, features).subscribe(
        (layer: VectorLayer) => {
          this.setActiveZoneLayer(layer);
          this.addFeaturesToLayer(layer, features);
        }
      );
    } else {
      this.addFeaturesToLayer(zoneLayer, features, buffer);
    }
  }

  private createZoneLayer(zoneIndex: number, features: Feature[]) {
    const filterLabel = this.languageService.translate.instant(
      'igo.geo.spatialFilter.spatialFilter'
    );
    const options: VectorLayerOptions = {
      isIgoInternalLayer: true,
      title: `Zone ${zoneIndex} - ${filterLabel}`,
      workspace: { enabled: true },
      _internal: {
        code:
          this.type() === SpatialFilterType.Predefined
            ? features[0].properties.code
            : undefined
      },
      sourceOptions: {
        type: 'vector',
        queryable: true
      } as QueryableDataSourceOptions,
      visible: true
    };
    return this.layerService.createAsyncLayer(options).pipe(take(1));
  }

  private setActiveZoneLayer(layer: VectorLayer) {
    this.map.layerController.add(layer);
    this.layers.push(layer);
    if (this.type() === SpatialFilterType.Predefined) {
      this.activePredefinedLayerZones = layer;
    } else {
      this.activeDrawLayerZones = layer;
    }
    this.pushLayer(layer);
  }

  private addFeaturesToLayer(
    layer: VectorLayer,
    features: Feature[],
    buffer?: boolean
  ) {
    const olSource = layer.dataSource.ol;

    if (buffer) olSource.clear();

    const featuresOl = features.map((f) => featureToOl(f, this.map.projection));

    if (this.type() !== SpatialFilterType.Predefined) {
      const type =
        this.type() === SpatialFilterType.Point ? 'Cercle' : 'Polygone';
      for (const f of featuresOl) {
        f.set('nom', 'Zone', true);
        f.set('type', type, true);
      }
    }

    olSource.addFeatures(featuresOl);
    layer.ol.setStyle(this.defaultStyle);
    if (this.type() === SpatialFilterType.Predefined) {
      this.zoomToOlFeatures(olSource.getFeatures());
    }
  }

  private zoomToOlFeatures(featuresOl: OlFeature[]) {
    if (!featuresOl.length) return;
    moveToOlFeatures(this.map.viewController, featuresOl, FeatureMotion.Zoom);
  }

  onAddZone(features: Feature[] | Feature, buffer = false) {
    if (!features) return;
    const featureList = Array.isArray(features) ? features : [features];
    this.zones = buffer ? featureList : [...this.zones, ...featureList];
    if (!buffer && this.zonesExistsInLayers()) return;
    this.addFeaturesToMap(this.zones, buffer);
  }

  onDrawZoneChange(zone: Feature): void {
    if (!zone) return;
    this.zones = [zone];
  }

  onRemovedZone(feature: Feature) {
    const zoneLayer = this.activePredefinedLayerZones;
    if (!zoneLayer) return;
    const olSource = zoneLayer.dataSource.ol;

    // Convert to OL feature (same way as when adding)
    const featureOl = featureToOl(feature, this.map.projection);

    // Find matching OL feature(s) by id or geometry
    const toRemove = olSource.getFeatures().filter((f) => {
      return f.getId() === featureOl.getId();
    });

    if (toRemove.length) {
      toRemove.forEach((f) => olSource.removeFeature(f));
      this.zones = this.zones.filter((z) => z.meta.id !== feature.meta.id);
    }

    if (olSource.getFeatures().length === 0) {
      this.map.layerController.remove(zoneLayer);
      this.layers = this.layers.filter((l) => l !== zoneLayer);
      this.activeLayers = [];
      this.activePredefinedLayerZones = undefined;
    }
    this.zoomToOlFeatures(olSource.getFeatures());
  }

  private zonesExistsInLayers(): boolean {
    const featuresOl = this.zones.map((f) =>
      featureToOl(f, this.map.projection)
    );
    const keysNew = new Set(featuresOl.map((f) => `id:${f.getId()}`));

    return this.layers
      .filter((l) => l.title.includes('Zone'))
      .some((layer) => {
        const olSource = layer.dataSource.ol as olSourceVector;
        const layerFeatures = olSource.getFeatures();
        const keysLayer = new Set(layerFeatures.map((f) => `id:${f.getId()}`));
        for (const key of keysNew) {
          if (!keysLayer.has(key)) {
            return false;
          }
        }
        return true;
      });
  }

  private pushLayer(layer: Layer): void {
    for (const activeLayer of this.activeLayers) {
      if (activeLayer.id === layer.id) {
        return;
      }
    }

    this.activeLayers.push(layer);
  }
}
