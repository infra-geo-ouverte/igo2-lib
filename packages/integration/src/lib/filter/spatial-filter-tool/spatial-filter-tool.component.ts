import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  IgoMap,
  DataSourceService,
  LayerService,
  Feature,
  moveToOlFeatures,
  FeatureMotion,
  ClusterDataSource,
  featureToOl,
  DataSource,
  QueryableDataSourceOptions,
  SpatialFilterService,
  SpatialFilterType,
  SpatialFilterItemType,
  SpatialFilterQueryType,
  SpatialFilterThematic,
  Layer,
  createOverlayMarkerStyle,
  ExportOptions
} from '@igo2/geo';
import { EntityStore, ToolComponent } from '@igo2/common';
import olFormatGeoJSON from 'ol/format/GeoJSON';
import { BehaviorSubject } from 'rxjs';
import { MapState } from '../../map/map.state';
import { ImportExportState } from './../../import-export/import-export.state';
import * as olstyle from 'ol/style';
import { MessageService, LanguageService } from '@igo2/core';
import { ToolState } from '../../tool/tool.state';
import { WorkspaceState } from '../../workspace/workspace.state';

/**
 * Tool to apply spatial filter
 */
@ToolComponent({
  name: 'spatialFilter',
  title: 'igo.integration.tools.spatialFilter',
  icon: 'selection-marker'
})
/**
 * Spatial Filter Type
 */
@Component({
  selector: 'igo-spatial-filter-tool',
  templateUrl: './spatial-filter-tool.component.html',
  styleUrls: ['./spatial-filter-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpatialFilterToolComponent {
  get map(): IgoMap {
    return this.mapState.map;
  }

  @Input() type: SpatialFilterType;
  @Input() itemType: SpatialFilterItemType = SpatialFilterItemType.Address;
  @Input() freehandDrawIsActive: boolean;

  public layers: Layer[] = [];
  public activeLayers: Layer[] = [];

  public queryType: SpatialFilterQueryType;
  public thematics: SpatialFilterThematic[];
  public zone: Feature;
  public radius: number;

  public iterator = 1;

  public selectedFeature$: BehaviorSubject<Feature> = new BehaviorSubject(
    undefined
  );

  private format = new olFormatGeoJSON();

  public store: EntityStore<Feature> = new EntityStore<Feature>([]); // Store to print results at the end

  public spatialListStore: EntityStore<Feature> = new EntityStore<Feature>([]);

  public loading = false;

  public thematicLength = 0;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private spatialFilterService: SpatialFilterService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private mapState: MapState,
    private messageService: MessageService,
    private languageService: LanguageService,
    private importExportState: ImportExportState,
    private toolState: ToolState,
    private workspaceState: WorkspaceState,
    private cdRef: ChangeDetectorRef
  ) {}

  getOutputType(event: SpatialFilterType) {
    this.type = event;
    this.queryType = undefined;
    this.radius = undefined;
  }

  getOutputQueryType(event: SpatialFilterQueryType) {
    this.queryType = event;
    if (this.queryType) {
      this.loadFilterList();
    }
  }

  activateExportTool() {
    const ids = [];
    for (const layer of this.layers) {
      ids.push(layer.id);
    }
    this.importExportState.setMode('export');
    this.importExportState.setsExportOptions({ layers: ids } as ExportOptions);
    this.toolState.toolbox.activateTool('importExport');
  }

  activateWorkspace() {
    let layerToOpenWks;
    this.workspaceState.store.entities$.subscribe(() => {
      if (this.activeLayers.length && this.workspaceState.store.all().length > 1) {
        if (this.itemType === SpatialFilterItemType.Thematics) {
            for (const thematic of this.thematics) {
              if (!thematic.zeroResults) {
                layerToOpenWks = this.activeLayers.find(layer => layer.title.includes(thematic.name + ' ' + this.iterator.toString()));
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
          this.workspaceState.setActiveWorkspaceByLayerId(layerToOpenWks.id);
        }
      }
    });
  }

  private loadFilterList() {
    this.spatialFilterService
      .loadFilterList(this.queryType)
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
    this.layers = [];
    this.activeLayers = [];
    this.thematicLength = 0;
    this.iterator = 1;
    if (this.type !== SpatialFilterType.Predefined) {
      this.zone = undefined;
    }
  }

  private loadThematics() {
    this.loading = true;
    let zeroResults = true;
    let thematics;
    this.tryAddFeaturesToMap([this.zone]);
    if (this.itemType !== SpatialFilterItemType.Thematics) {
      const theme: SpatialFilterThematic = {
        name: ''
      };
      thematics = [theme];
    } else {
      thematics = this.thematics;
    }
    if (this.type === SpatialFilterType.Polygon) {
      this.radius = undefined;
    }
    const observables$: Observable<Feature[]>[] = [];
    thematics.forEach(thematic => {
      observables$.push(
        this.spatialFilterService
          .loadFilterItem(
            this.zone,
            this.itemType,
            this.queryType,
            thematic,
            this.radius
          )
          .pipe(
            tap((features: Feature[]) => {
              this.store.insertMany(features);
              const featuresPoint: Feature[] = [];
              const featuresLinePoly: Feature[] = [];
              let idPoint;
              let idLinePoly;
              features.forEach(feature => {
                if (feature.geometry.type === 'Point') {
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
                  this.languageService.translate.instant(
                    'igo.geo.spatialFilter.maxSizeAlert'
                  ),
                  this.languageService.translate.instant(
                    'igo.geo.spatialFilter.warning'
                  ),
                  { timeOut: 10000 }
                );
              }
            })
          )
      );
    });

    forkJoin(observables$).subscribe(() => {
      this.loading = false;
      if (zeroResults) {
        this.messageService.alert(
          this.languageService.translate.instant(
            'igo.geo.spatialFilter.zeroResults'
          ),
          this.languageService.translate.instant(
            'igo.geo.spatialFilter.warning'
          ),
          { timeOut: 10000 }
        );
      }
    });
  }

  onZoneChange(feature: Feature) {
    this.zone = feature;
    if (feature) {
      this.tryAddFeaturesToMap([feature]);
      this.zoomToFeatureExtent(feature);
    }
  }

  /**
   * Try to add zone feature to the map overlay
   */
  public tryAddFeaturesToMap(features: Feature[]) {
    let i = 1;
    for (const feature of features) {
      if (this.type === SpatialFilterType.Predefined) {
        for (const layer of this.map.layers) {
          if (
            layer.options._internal &&
            layer.options._internal.code === feature.properties.code
          ) {
            return;
          }
          if (layer.title?.startsWith('Zone')) {
            this.map.removeLayer(layer);
          }
        }
      } else {
        this.activeLayers = [];
      }
      for (const layer of this.layers) {
        if (layer.title?.startsWith('Zone')) {
          i++;
        }
      }
      this.dataSourceService
        .createAsyncDataSource({
          type: 'vector',
          queryable: true
        } as QueryableDataSourceOptions)
        .subscribe((dataSource: DataSource) => {
          const olLayer = this.layerService.createLayer({
            title: ('Zone ' + i) as string,
            _internal: {
              code:
                this.type === SpatialFilterType.Predefined
                  ? feature.properties.code
                  : undefined
            },
            source: dataSource,
            visible: true,
            style: (_feature, resolution) => {
              const coordinates = (features[0] as any).coordinates;
              return new olstyle.Style({
                image: new olstyle.Circle({
                  radius: coordinates
                    ? this.radius /
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
            }
          });
          const featuresOl = features.map(f => {
            return featureToOl(f, this.map.projection);
          });
          if (this.type !== SpatialFilterType.Predefined) {
            const type = this.type === SpatialFilterType.Point ? 'Cercle' : 'Polygone';
            featuresOl[0].set('nom', 'Zone', true);
            featuresOl[0].set('type', type, true);
          }
          dataSource.ol.addFeatures(featuresOl);
          this.map.addLayer(olLayer);
          this.layers.push(olLayer);
          this.activeLayers.push(olLayer);
          this.cdRef.detectChanges();
        });
    }
  }

  /**
   * Try to point features to the map
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
        .subscribe((dataSource: ClusterDataSource) => {
          const icon = features[0].meta.icon;
          let style: olstyle.Style;
          if (!icon) {
            style = createOverlayMarkerStyle();
          } else {
            style = this.createSvgIcon(icon) || createOverlayMarkerStyle();
          }

          const olLayer = this.layerService.createLayer({
            title: (features[0].meta.title + ' ' + i) as string,
            source: dataSource,
            visible: true,
            style
          });

          const featuresOl = features.map(feature => {
            return featureToOl(feature, this.map.projection);
          });
          dataSource.ol.source.addFeatures(featuresOl);
          if (this.map.layers.find(layer => layer.id === olLayer.id)) {
            this.map.removeLayer(
              this.map.layers.find(layer => layer.id === olLayer.id)
            );
            i = i - 1;
            olLayer.title = (features[0].meta.title + ' ' + i) as string;
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

  private createSvgIcon(icon) {
    let style: olstyle.Style;
    this.matIconRegistry.getNamedSvgIcon(icon).subscribe(svgObj => {
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
      for (const layer of this.map.layers) {
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
        .subscribe((dataSource: DataSource) => {
          const olLayer = this.layerService.createLayer({
            title: (features[0].meta.title + ' ' + i) as string,
            source: dataSource,
            visible: true
          });
          const featuresOl = features.map(feature => {
            return featureToOl(feature, this.map.projection);
          });
          dataSource.ol.addFeatures(featuresOl);
          if (this.map.layers.find(layer => layer.id === olLayer.id)) {
            this.map.removeLayer(
              this.map.layers.find(layer => layer.id === olLayer.id)
            );
            i = i - 1;
            olLayer.title = (features[0].meta.title + ' ' + i) as string;
            olLayer.options.title = olLayer.title;
          }
          this.map.addLayer(olLayer);
          this.layers.push(olLayer);
          this.pushLayer(olLayer);
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
      moveToOlFeatures(this.map, [olFeature], FeatureMotion.Zoom);
    }
  }

  pushLayer(layer) {
    let push = true;
    for (const lay of this.activeLayers) {
      if (lay.id === layer.id) {
        push = false;
      }
    }

    if (push === true) {
      this.activeLayers.push(layer);
    }
  }
}
