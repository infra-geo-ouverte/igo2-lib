import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

import { EntityStore } from '@igo2/common/entity';
import { SELECTION_MARKER_ICON } from '@igo2/common/icon';
import { PanelComponent } from '@igo2/common/panel';
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

import olFormatGeoJSON from 'ol/format/GeoJSON';
import olSourceCluster from 'ol/source/Cluster';
import olSourceVector from 'ol/source/Vector';
import * as olstyle from 'ol/style';

import { Observable, Subject, forkJoin } from 'rxjs';
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
  standalone: true,
  imports: [
    SpatialFilterTypeComponent,
    SpatialFilterItemComponent,
    PanelComponent,
    FeatureDetailsComponent,
    NgIf,
    AsyncPipe
  ]
})
export class SpatialFilterToolComponent implements OnInit, OnDestroy {
  get map(): IgoMap {
    return this.mapState.map;
  }

  @Input() type: SpatialFilterType;
  @Input() itemType: SpatialFilterItemType = SpatialFilterItemType.Address;
  @Input() freehandDrawIsActive: boolean;

  public layers: AnyLayer[] = [];
  public activeLayers: AnyLayer[] = [];

  public queryType: SpatialFilterQueryType;
  public thematics: SpatialFilterThematic[];
  public zone: Feature;
  public zoneWithBuffer: Feature;
  public buffer = 0;

  public iterator = 1;

  public selectedFeature$ = new BehaviorSubject<Feature>(undefined);

  private format = new olFormatGeoJSON();

  public store: EntityStore<Feature> = new EntityStore<Feature>([]); // Store to print results at the end

  public spatialListStore: EntityStore<Feature> = new EntityStore<Feature>([]);

  public loading = false;

  public thematicLength = 0;

  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;
  private unsubscribe$ = new Subject<void>();

  public defaultStyle: olstyle.Style | ((feature, resolution) => olstyle.Style);

  constructor(
    private matIconRegistry: MatIconRegistry,
    private spatialFilterService: SpatialFilterService,
    private layerService: LayerService,
    private mapState: MapState,
    private messageService: MessageService,
    private languageService: LanguageService,
    private importExportState: ImportExportState,
    private toolState: ToolState,
    private workspaceState: WorkspaceState,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    for (const layer of this.map.layerController.all) {
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

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getOutputType(event: SpatialFilterType) {
    this.type = event;
    this.queryType = undefined;
  }

  getOutputQueryType(event: SpatialFilterQueryType) {
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
            this.itemType === SpatialFilterItemType.Thematics &&
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
            this.workspaceState.workspacePanelExpanded = true;
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
    this.zone = undefined;
    this.queryType = undefined;
  }

  clearMap() {
    this.map.layerController.remove(...this.layers);
    this.layers = [];
    this.activeLayers = [];
    this.thematicLength = 0;
    this.iterator = 1;
    if (this.type === SpatialFilterType.Predefined) {
      this.zone = undefined;
      this.queryType = undefined;
    }
  }

  private loadThematics() {
    this.loading = true;
    let zeroResults = true;
    let thematics;
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
    thematics.forEach((thematic) => {
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
              let idPoint;
              let idLinePoly;
              features.forEach((feature) => {
                if (feature.geometry.type === 'Point') {
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

  onZoneChange(feature: Feature, buffer?: boolean) {
    this.zone = feature;
    if (feature) {
      this.tryAddFeaturesToMap([feature], buffer);
      this.zoomToFeatureExtent(feature);
    }
  }

  /**
   * Try to add zone feature to the map overlay
   */
  public tryAddFeaturesToMap(features: Feature[], buffer?: boolean) {
    let i = 1;
    for (const feature of features) {
      if (this.type === SpatialFilterType.Predefined) {
        for (const layer of this.layers) {
          if (
            isLayerItem(layer) &&
            layer.options._internal &&
            layer.options._internal.code === feature.properties.code &&
            !buffer
          ) {
            if (!layer.title?.startsWith('Zone')) {
              const index = this.layers.indexOf(layer);
              this.layers.splice(index, 1);
            }
            return;
          }
          if (layer.title?.startsWith('Zone')) {
            this.activeLayers = [];
            const index = this.layers.indexOf(layer);
            this.layers.splice(index, 1);
            this.map.layerController.remove(layer);
          }
        }
      } else {
        if (buffer) {
          for (const layer of this.activeLayers) {
            if (
              this.activeLayers.length === 1 &&
              layer.title?.startsWith('Zone')
            ) {
              const index = this.layers.indexOf(layer);
              this.layers.splice(index, 1);
              this.map.layerController.remove(layer);
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
        const coordinates = (features[0] as any).coordinates;
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

      const options: VectorLayerOptions = {
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
        sourceOptions: {
          type: 'vector',
          queryable: true
        } as QueryableDataSourceOptions,
        visible: true
      };

      this.layerService
        .createAsyncLayer(options)
        .pipe(take(1))
        .subscribe((layer: VectorLayer) => {
          const featuresOl = features.map((f) => {
            return featureToOl(f, this.map.projection);
          });

          if (this.type !== SpatialFilterType.Predefined) {
            const type =
              this.type === SpatialFilterType.Point ? 'Cercle' : 'Polygone';
            featuresOl[0].set('nom', 'Zone', true);
            featuresOl[0].set('type', type, true);
          }
          const ol = layer.dataSource.ol as olSourceVector | olSourceCluster;
          ol.addFeatures(featuresOl);
          layer.ol.setStyle(this.defaultStyle);

          this.map.layerController.add(layer);

          this.layers.push(layer);
          this.activeLayers.push(layer);
          this.cdRef.detectChanges();
        });
    }
  }

  /**
   * Try to add point features to the map
   * Necessary to create clusters
   */
  private tryAddPointToMap(features: Feature[], id) {
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

      const icon = features[0].meta.icon;
      let style: olstyle.Style;
      if (!icon) {
        style = createOverlayMarkerStyle();
      } else {
        style = this.createSvgIcon(icon) || createOverlayMarkerStyle();
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
            layer.title = (features[0].meta.title +
              ' ' +
              i +
              ' - ' +
              this.languageService.translate.instant(
                'igo.geo.spatialFilter.spatialFilter'
              )) as string;
            layer.options.title = layer.title;
          }
          this.iterator = i;
          this.map.layerController.add(layer);
          this.layers.push(layer);
          this.pushLayer(layer);
          this.cdRef.detectChanges();
        });
    }
  }

  private createSvgIcon(icon): olstyle.Style {
    let style: olstyle.Style;
    this.matIconRegistry.getNamedSvgIcon(icon).subscribe((svgObj) => {
      const xmlSerializer = new XMLSerializer();
      svgObj.setAttribute('width', '30');
      svgObj.setAttribute('height', '30');
      svgObj.setAttribute('fill', 'rgba(0, 128, 255)');
      svgObj.setAttribute('stroke', 'white');
      const svg = xmlSerializer.serializeToString(svgObj);
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
          this.cdRef.detectChanges();
        });
    }
  }

  zoomToFeatureExtent(feature) {
    if (feature) {
      const olFeature = this.format.readFeature(feature, {
        dataProjection: feature.projection,
        featureProjection: this.map.projection
      });
      moveToOlFeatures(
        this.map.viewController,
        [olFeature],
        FeatureMotion.Zoom
      );
    }
  }

  pushLayer(layer) {
    for (const lay of this.activeLayers) {
      if (lay.id === layer.id) {
        return;
      }
    }

    this.activeLayers.push(layer);
  }
}
