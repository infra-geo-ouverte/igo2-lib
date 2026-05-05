import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  model
} from '@angular/core';

import { EntityStore } from '@igo2/common/entity';
import { SELECTION_MARKER_ICON } from '@igo2/common/icon';
import { ToolComponent } from '@igo2/common/tool';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import {
  AnyLayer,
  ExportOptions,
  Feature,
  FeatureDetailsComponent,
  FeatureMotion,
  IgoMap,
  LayerService,
  MeasureLengthUnit,
  QueryableDataSourceOptions,
  RADIUS_NAME,
  SpatialFilterItemComponent,
  SpatialFilterItemType,
  SpatialFilterQueryType,
  SpatialFilterService,
  SpatialFilterThematic,
  SpatialFilterType,
  SpatialFilterTypeComponent,
  VectorLayer,
  VectorLayerOptions,
  createOverlayMarkerStyle,
  featureToOl,
  isLayerItem,
  moveToOlFeatures
} from '@igo2/geo';

import OlFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import OlPoint from 'ol/geom/Point';
import { transform } from 'ol/proj';
import olSourceCluster from 'ol/source/Cluster';
import olSourceVector from 'ol/source/Vector';
import * as olstyle from 'ol/style';

import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { MapState } from '../../map/map.state';
import { ToolState } from '../../tool/tool.state';
import { WorkspaceState } from '../../workspace/workspace.state';
import {
  ImportExportMode,
  ImportExportState
} from './../../import-export/import-export.state';

/**
 * Tool to apply spatial filter
 */
@ToolComponent({
  name: 'spatialFilter',
  title: 'igo.integration.tools.spatialFilter',
  icon: SELECTION_MARKER_ICON
})
/**
 * Spatial Filter Type
 */
@Component({
  selector: 'igo-spatial-filter-tool',
  templateUrl: './spatial-filter-tool.component.html',
  styleUrls: ['./spatial-filter-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SpatialFilterTypeComponent,
    SpatialFilterItemComponent,
    FeatureDetailsComponent,
    AsyncPipe
  ]
})
export class SpatialFilterToolComponent implements OnInit, OnDestroy {
  private spatialFilterService = inject(SpatialFilterService);
  private layerService = inject(LayerService);
  private mapState = inject(MapState);
  private messageService = inject(MessageService);
  private languageService = inject(LanguageService);
  private importExportState = inject(ImportExportState);
  private toolState = inject(ToolState);
  private workspaceState = inject(WorkspaceState);
  private cdRef = inject(ChangeDetectorRef);

  get map(): IgoMap {
    return this.mapState.map;
  }

  readonly type = model<SpatialFilterType>(undefined);
  readonly itemType = model<SpatialFilterItemType>(
    SpatialFilterItemType.Thematics
  );
  readonly freehandDrawIsActive = model<boolean>(undefined);

  public layers: AnyLayer[] = [];
  public activeLayers: AnyLayer[] = [];

  public queryType: SpatialFilterQueryType;
  public thematics: SpatialFilterThematic[];

  public buffer = 0;

  public iterator = 1;

  public selectedFeature$ = new BehaviorSubject<Feature>(undefined);

  public store: EntityStore<Feature> = new EntityStore<Feature>([]); // Store to print results at the end

  public spatialListStore: EntityStore<Feature> = new EntityStore<Feature>([]);

  public loading = false;

  public thematicLength = 0;

  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;

  public defaultStyle: olstyle.Style | ((feature, resolution) => olstyle.Style);
  public zones: Feature[] = [];

  private unsubscribe$ = new Subject<void>();
  private activePredefinedLayerZones: VectorLayer;
  private activeDrawLayerZones: VectorLayer;

  ngOnInit() {
    for (const layer of this.map.layerController.all) {
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

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getOutputType(event: SpatialFilterType) {
    this.type.set(event);
    this.queryType = undefined;
  }

  getOutputQueryType(event: SpatialFilterQueryType) {
    if (event !== this.queryType) {
      this.zones = [];
      this.activePredefinedLayerZones = undefined;
    }

    this.queryType = event;
    if (this.queryType) {
      this.loadFilterList();
    }
  }

  activateExportTool() {
    const ids = [];
    const re = new RegExp('^Zone \\d+');
    for (const layer of this.layers) {
      if (!layer.title.match(re)) {
        ids.push(layer.id);
      }
    }
    this.importExportState.setMode(ImportExportMode.export);
    this.importExportState.setsExportOptions({ layers: ids } as ExportOptions);
    this.toolState.toolbox.activateTool('importExport');
  }

  activateWorkspace(record?) {
    let layerToOpenWks;
    this.workspaceState.store.entities$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        if (
          !record &&
          this.activeLayers.length &&
          this.workspaceState.store.all().length > 1
        ) {
          if (
            this.itemType() === SpatialFilterItemType.Thematics &&
            this.thematics
          ) {
            for (const thematic of this.thematics) {
              if (!thematic.zeroResults) {
                layerToOpenWks = this.activeLayers.find((layer) =>
                  layer.title.includes(
                    thematic.name + ' ' + this.iterator.toString()
                  )
                );
                break;
              }
            }
          } else {
            const title = 'Adresses ' + this.iterator.toString();
            this.activeLayers.forEach((layer) => {
              if (layer.title.includes(title)) {
                layerToOpenWks = layer;
              }
            });
          }

          if (layerToOpenWks) {
            this.workspaceState.expanded.set(true);
            this.workspaceState.setActiveWorkspaceById(layerToOpenWks.id);
          }
        } else if (
          record &&
          this.activeLayers.length &&
          this.workspaceState.store.all().length > 1
        ) {
          this.selectWorkspaceEntity(record);
          this.map.ol.on('moveend', () => {
            this.selectWorkspaceEntity(record);
          });
        }
      });
  }

  private selectWorkspaceEntity(record) {
    this.workspaceState.store.all().forEach((workspace) => {
      workspace.entityStore.state.updateAll({ selected: false });
      if (workspace.title.includes(record.added[0].meta.title)) {
        this.workspaceState.setActiveWorkspaceById(workspace.id);
        workspace.entityStore.state.updateMany(record.added, {
          selected: true
        });
      }
    });
  }

  private loadFilterList() {
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

  getOutputToggleSearch() {
    this.loadThematics();
  }

  getOutputClearSearch() {
    this.zones = [];
    this.queryType = undefined;
  }

  clearMap() {
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

  private loadThematics() {
    this.loading = true;
    let zeroResults = true;
    let thematics!: SpatialFilterThematic[];
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
          this.store.clear();
          this.workspaceState.store.clear();
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
        if (this.type() !== SpatialFilterType.Predefined) {
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
  private tryAddPointToMap(features: Feature[], id) {
    // 🔑 Get active zone index from its title
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

    // Count how many layers with the same meta.title already exist
    let i = 1;
    for (const layer of this.layers) {
      if (layer.title?.startsWith(titleFeature)) {
        i++;
      }
    }

    const style = createOverlayMarkerStyle();

    // 🔑 Use zoneIndex to sync layer naming
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
          this.layers = this.layers.filter((l) => l.id !== layer.id);
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
  private tryAddLayerToMap(features: Feature[], id) {
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
          const ol = layer.dataSource.ol as olSourceVector;
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

  private pushLayer(layer) {
    for (const lay of this.activeLayers) {
      if (lay.id === layer.id) {
        return;
      }
    }

    this.activeLayers.push(layer);
  }

  onAddZone(feature: Feature | undefined) {
    const featureList = feature ? [feature] : [];
    this.zones = [...this.zones, ...featureList];
    if (!this.zones.length) return;
    this.addFeaturesToMap(this.zones, false);
  }

  onAddZoneWithBuffer(features: Feature[] | Feature) {
    this.zones = Array.isArray(features) ? features : [features];
    this.addFeaturesToMap(this.zones, true);
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

  private addFeaturesToMap(features: Feature[], buffer?: boolean) {
    const type = this.type();
    if (
      type === SpatialFilterType.Predefined &&
      this.zonesExistsInLayers() &&
      !buffer
    )
      return;

    const lastZoneIndex = this.findLastZoneIndex();
    const zoneLayer =
      type === SpatialFilterType.Predefined
        ? this.activePredefinedLayerZones
        : undefined;
    if (!zoneLayer) {
      this.defaultStyle = this.createZoneStyle(features[0]);
      this.createZoneLayer(lastZoneIndex + 1, features).subscribe(
        (layer: VectorLayer) => {
          this.setActiveZoneLayer(layer);
          this.addFeaturesToLayer(layer, features);
          this.cdRef.detectChanges();
        }
      );
    } else {
      this.addFeaturesToLayer(zoneLayer, features, buffer);
    }
  }

  private zonesExistsInLayers(): boolean {
    if (this.type() !== SpatialFilterType.Predefined) return false;
    return this.layers
      .filter((l) => l.title.includes('Zone'))
      .some((layer) => {
        const olSource = layer.dataSource.ol as olSourceVector;
        const layerFeatures = olSource.getFeatures();
        return this.zones.every((zone) =>
          layerFeatures.some((feature) => feature.getId() === zone.meta.id)
        );
      });
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

    const type = this.type();
    if (type !== SpatialFilterType.Predefined) {
      const customType =
        type === SpatialFilterType.Point ? 'Cercle' : 'Polygone';
      for (const f of featuresOl) {
        f.set('nom', 'Zone', true);
        f.set('type', customType, true);
        if (type === SpatialFilterType.Point) {
          this.setPointProps(
            featuresOl[0] as OlFeature<OlPoint>,
            this.map.projectionCode,
            this.buffer
          );
        }
      }
    }

    olSource.addFeatures(featuresOl);
    layer.ol.setStyle(this.defaultStyle);
    if (type === SpatialFilterType.Predefined) {
      this.zoomToOlFeatures(olSource.getFeatures());
    }
  }

  private zoomToOlFeatures(featuresOl: OlFeature<OlGeometry>[]) {
    if (!featuresOl.length) return;
    moveToOlFeatures(this.map.viewController, featuresOl, FeatureMotion.Zoom);
  }

  private setPointProps(
    featureOl: OlFeature<OlPoint>,
    projectionCode: string,
    radius: number
  ): void {
    const olGeometry = featureOl.getGeometry();
    const [longitude, latitude] = transform(
      olGeometry.getFlatCoordinates(),
      projectionCode,
      'EPSG:4326'
    );

    const props = {
      [RADIUS_NAME]: radius,
      _projection: projectionCode,
      latitude,
      longitude
    };
    Object.entries(props).forEach(([key, value]) =>
      featureOl.set(key, value, true)
    );
  }
}
