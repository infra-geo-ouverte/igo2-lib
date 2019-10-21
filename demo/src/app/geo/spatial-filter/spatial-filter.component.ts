import { AnyDataSourceOptions } from './../../../../../packages/geo/src/lib/datasource/shared/datasources/any-datasource.interface';
import { Component, Input } from '@angular/core';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  Feature,
  moveToOlFeatures,
  FeatureMotion,
  ClusterDataSource,
  ClusterDataSourceOptions,
  featureToOl,
  DataSourceOptions,
  DataSource,
  createOverlayMarkerStyle,
  QueryableDataSourceOptions
} from '@igo2/geo';
import { SpatialFilterService } from './../../../../../packages/geo/src/lib/filter/shared/spatial-filter.service';
import { SpatialFilterQueryType } from '@igo2/geo/lib/filter/shared/spatial-filter.enum';
import { SpatialFilterType, SpatialFilterItemType } from './../../../../../packages/geo/src/lib/filter/shared/spatial-filter.enum';
import { FormService, EntityStore } from '@igo2/common';
import olFormatGeoJSON from 'ol/format/GeoJSON';
import { Observable, BehaviorSubject } from 'rxjs';
import * as olstyle from 'ol/style';

@Component({
  selector: 'app-spatial-filter',
  templateUrl: './spatial-filter.component.html',
  styleUrls: ['./spatial-filter.component.scss']
})
export class AppSpatialFilterComponent {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  view = {
    center: [-71.9, 46.9],
    zoom: 10
  };

  @Input() type: SpatialFilterType;
  @Input() itemType: SpatialFilterItemType = SpatialFilterItemType.Address;
  public queryType: SpatialFilterQueryType;
  public thematics: string[];
  public zone: Feature;
  public radius: number;
  public clearSearch;

  public selectedFeature$: BehaviorSubject<Feature> = new BehaviorSubject(undefined);

  private format = new olFormatGeoJSON();

  public spatialListStore = new EntityStore<Feature>([]);

  public spatialItemStore = new EntityStore<Feature>([]);

  public loading = false;

  constructor(
    private spatialFilterService: SpatialFilterService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      })
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            baseLayer: true,
            visible: true
          })
        );
      });
    }

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
    this.spatialFilterService.loadFilterItem(this.zone, this.itemType, this.queryType, this.thematics, this.radius)
      .subscribe((features: Feature[]) => {
        this.spatialItemStore.clear();
        this.spatialItemStore.load(features);
        this.tryAddFeaturesToMap([this.zone]);
        const featuresPoint: Feature[] = [];
        const featuresLinePoly: Feature[] = [];
        features.forEach(feature => {
          if (feature.geometry.type === 'Point') {
            featuresPoint.push(feature);
          } else {
            featuresLinePoly.push(feature);
          }
        });
        this.tryAddPointToMap(featuresPoint);
        this.tryAddLayerToMap(featuresLinePoly);
        this.loading = false;
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
   * Try to add features to the map overlay
   */
  public tryAddFeaturesToMap(features: Feature[]) {
    for (const layer of this.map.layers) {
      if (this.map.layers.find(layer => layer.title === 'Zone')) {
        return;
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
          source: dataSource,
          visible: true,
          style: {
            // circle: {
            //   radius: this.radius,
            //   fill: {
            //     color: 'rgba(200, 200, 20, 0.3)'
            //   },
            //   stroke: {
            //     width: 1,
            //     color: 'orange'
            //   }
            // },
            stroke: {
              width: 1,
              color: 'orange'
            },
            fill: {
              color: 'rgba(200, 200, 20, 0.3)'
            }
          }
        });
        const featuresOl = features.map(feature => {
          return featureToOl(feature, this.map.projection);
        });
        dataSource.ol.addFeatures(featuresOl);
        this.map.addLayer(olLayer);
      });
  }

  private tryAddPointToMap(features: Feature[]) {
    if (this.map === undefined) {
      return;
    }
    this.dataSourceService
    .createAsyncDataSource({
      type: 'cluster',
      queryable: true,
      distance: 150
      } as QueryableDataSourceOptions )
      .subscribe((dataSource: ClusterDataSource) => {
        const olLayer = this.layerService.createLayer({
          title: 'Vector Layer',
          source: dataSource,
          visible: true,
          style: createOverlayMarkerStyle(),
          clusterParam: {clusterRange: [1, 5]}
        });
        const featuresOl = features.map(feature => {
          return featureToOl(feature, this.map.projection);
        });
        dataSource.ol.source.addFeatures(featuresOl);
        this.map.addLayer(olLayer);
      });
  }

  private tryAddLayerToMap(features: Feature[]) {
    if (this.map === undefined) {
      return;
    }
    this.dataSourceService
    .createAsyncDataSource({
      type: 'vector',
      queryable: true,
      distance: 40
      } as QueryableDataSourceOptions )
      .subscribe((dataSource: DataSource) => {
        const olLayer = this.layerService.createLayer({
          title: 'Vector Layer',
          source: dataSource,
          visible: true
        });
        const featuresOl = features.map(feature => {
          return featureToOl(feature, this.map.projection);
        });
        dataSource.ol.addFeatures(featuresOl);
        this.map.addLayer(olLayer);
      });
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
    console.log(results);
    console.log(this.map);
    const features: Feature[] = results.features;
    let feature;
    if (features.length) {
      console.log('2');
      feature = features[0];
    }
    console.log('3');
    this.selectedFeature$.next(feature);
    console.log(this.selectedFeature$);
  }
}
