import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
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
  createOverlayMarkerStyle,
  QueryableDataSourceOptions,
  SpatialFilterService,
  SpatialFilterType,
  SpatialFilterItemType,
  SpatialFilterQueryType
} from '@igo2/geo';
import { EntityStore, ToolComponent } from '@igo2/common';
import olFormatGeoJSON from 'ol/format/GeoJSON';
import { BehaviorSubject } from 'rxjs';
import { MapState } from '../../map/map.state';
import * as olstyle from 'ol/style';

/**
 * Tool to apply spatial filter
 */
@ToolComponent({
  name: 'spatialFilter',
  title: 'igo.integration.tools.spatialFilter',
  icon: 'grain'
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
  public queryType: SpatialFilterQueryType;
  public thematics: string[];
  public zone: Feature;
  public radius: number;
  public clearSearch;

  public selectedFeature$: BehaviorSubject<Feature> = new BehaviorSubject(undefined);

  private format = new olFormatGeoJSON();

  public spatialListStore: EntityStore<Feature> = new EntityStore<Feature>([]);

  public spatialItemStore: EntityStore<Feature> = new EntityStore<Feature>([]);

  public loading = false;

  constructor(
    private spatialFilterService: SpatialFilterService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private mapState: MapState
  ) {}

  getOutputType(event: SpatialFilterType) {
    this.type = event;
    this.queryType = undefined;
    this.thematics = undefined;
    this.radius = undefined;
  }

  getOutputQueryType(event: SpatialFilterQueryType) {
    this.queryType = event;
    if (this.queryType) {
      this.loadFilterList();
    }
  }

  private loadFilterList() {
    this.spatialFilterService.loadFilterList(this.queryType)
      .subscribe((features: Feature[]) => {
        this.spatialListStore.clear();
        this.spatialListStore.load(features);
      });
  }

  getOutputToggleSearch() {
    this.loadThematics();
  }

  getOutputClearSearch() {
    this.clearSearch = !this.clearSearch;
  }

  private loadThematics() {
    this.loading = true;
    this.tryAddFeaturesToMap([this.zone]);
    if (!this.thematics) {
      this.thematics = [SpatialFilterItemType.Address];
    }
    this.thematics.forEach(thematic => {
    this.spatialFilterService.loadFilterItem(this.zone, this.itemType, this.queryType, thematic, this.radius)
      .subscribe((features: Feature[]) => {
        this.spatialItemStore.clear();
        this.spatialItemStore.load(features);
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
        this.loading = false;
      });
    })
  }

  onZoneChange(feature: Feature) {
    this.zone = feature;
    if (feature) {
      this.tryAddFeaturesToMap([feature]);
      this.zoomToFeatureExtent(feature);
    }
  }

  /**
   * Try to add features to the map overlay
   */
  public tryAddFeaturesToMap(features: Feature[]) {
    for (const feature of features) {
      if (this.type === SpatialFilterType.Predefined) {
        for (const layer of this.map.layers) {
          if (layer.alias === feature.properties.code) {
            return;
          }
        }
      }
      this.dataSourceService
      .createAsyncDataSource({
        type: 'vector',
        queryable: true
      } as QueryableDataSourceOptions )
        .subscribe((dataSource: DataSource) => {
          const olLayer = this.layerService.createLayer({
            title: 'Zone',
            alias: this.type === SpatialFilterType.Predefined ? feature.properties.code : undefined,
            source: dataSource,
            visible: true,
            style: (feature, resolution) => {
              return new olstyle.Style({
                image: new olstyle.Circle({
                    radius: this.radius / resolution,
                    fill: new olstyle.Fill({
                      color: 'rgba(200, 200, 20, 0.3)'
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
                  color: 'rgba(200, 200, 20, 0.3)'
                })
              })
            }
          });
          const featuresOl = features.map(feature => {
            return featureToOl(feature, this.map.projection);
          });
          dataSource.ol.addFeatures(featuresOl);
          this.map.addLayer(olLayer);
        });
    }
  }

  private tryAddPointToMap(features: Feature[], id) {
    if (features.length > 1) {
      if (this.map === undefined) {
        return;
      }
      this.dataSourceService
      .createAsyncDataSource({
        type: 'cluster',
        id: id,
        queryable: true,
        distance: 150
        } as QueryableDataSourceOptions )
        .subscribe((dataSource: ClusterDataSource) => {
          const olLayer = this.layerService.createLayer({
            title: features[0].meta.title,
            source: dataSource,
            visible: true,
            style: createOverlayMarkerStyle(),
            clusterParam: {clusterRange: [1, 5]}
          });
          const featuresOl = features.map(feature => {
            return featureToOl(feature, this.map.projection);
          });
          dataSource.ol.source.addFeatures(featuresOl);
          if (this.map.layers.find(layer => layer.id === olLayer.id)) {
            this.map.removeLayer(this.map.layers.find(layer => layer.id === olLayer.id));
          }
          this.map.addLayer(olLayer);
        });
    }
  }

  private tryAddLayerToMap(features: Feature[], id) {
    if (features.length > 1) {
      if (this.map === undefined) {
        return;
      }
      this.dataSourceService
      .createAsyncDataSource({
        type: 'vector',
        id: id,
        queryable: true
        } as QueryableDataSourceOptions )
        .subscribe((dataSource: DataSource) => {
          const olLayer = this.layerService.createLayer({
            title: features[0].meta.title,
            source: dataSource,
            visible: true
          });
          const featuresOl = features.map(feature => {
            return featureToOl(feature, this.map.projection);
          });
          dataSource.ol.addFeatures(featuresOl);
          if (this.map.layers.find(layer => layer.id === olLayer.id)) {
            this.map.removeLayer(this.map.layers.find(layer => layer.id === olLayer.id));
          }
          this.map.addLayer(olLayer);
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

  handleQueryResults(results) {
    const features: Feature[] = results.features;
    let feature;
    if (features.length) {
      feature = features[0];
    }
    this.selectedFeature$.next(feature);
  }
}
