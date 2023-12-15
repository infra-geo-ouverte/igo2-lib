import { Component } from '@angular/core';

import { getEntityTitle } from '@igo2/common';
import {
  DataSourceService,
  Feature,
  FeatureDataSource,
  FeatureDataSourceOptions,
  FeatureMotion,
  IgoMap,
  ImageLayer,
  ImageLayerOptions,
  LayerOptions,
  LayerService,
  OSMDataSource,
  OSMDataSourceOptions,
  QueryFormat,
  QueryHtmlTarget,
  QueryableDataSource,
  QueryableDataSourceOptions,
  SearchResult,
  VectorLayerOptions,
  VectorTileLayer,
  VectorTileLayerOptions
} from '@igo2/geo';

import olFeature from 'ol/Feature';
import olLineString from 'ol/geom/LineString';
import olPoint from 'ol/geom/Point';
import olPolygon from 'ol/geom/Polygon';
import * as olproj from 'ol/proj';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss']
})
export class AppQueryComponent {
  public features$ = new BehaviorSubject<Feature[]>([]);

  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 6
  };

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService
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

    // Couche Réseau routier
    this.dataSourceService
      .createAsyncDataSource({
        type: 'wms',
        url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
        queryable: true,
        params: {
          layers: 'bgr_v_sous_route_res_sup_act',
          version: '1.3.0'
        }
      } as QueryableDataSourceOptions)
      .subscribe((dataSource: QueryableDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'WMS',
            source: dataSource
          } as ImageLayerOptions)
        );
      });

    // Couche Aéroports
    this.dataSourceService
      .createAsyncDataSource({
        type: 'wms',
        url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
        queryable: true,
        queryFormat: QueryFormat.HTMLGML2,
        queryHtmlTarget: QueryHtmlTarget.IFRAME,
        params: {
          layers: 'aeroport',
          version: '1.3.0'
        }
      } as QueryableDataSourceOptions)
      .subscribe((dataSource: QueryableDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'WMS html with a pre call in GML',
            source: dataSource
          } as ImageLayerOptions)
        );
      });

    // Couche Municipalités
    this.layerService
      .createAsyncLayer({
        title: 'WMS with different query url',
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/all.fcgi',
          queryable: true,
          queryFormat: QueryFormat.HTMLGML2,
          queryHtmlTarget: QueryHtmlTarget.IFRAME,
          queryUrls: [
            {
              url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&BBOX={bbox}&CRS=EPSG%3A3857&WIDTH=900&HEIGHT=632&LAYERS=SDA_REGION_S_20K&STYLES=&FORMAT=image%2Fpng&QUERY_LAYERS=SDA_REGION_S_20K&INFO_FORMAT=text%2Fhtml&I=467&J=493'
            }
          ],
          queryLayerFeatures: false,
          params: {
            layers: 'SDA_MUNIC_S_20K',
            version: '1.3.0'
          }
        }
      } as any)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));

    // Couche vectorielle
    this.dataSourceService
      .createAsyncDataSource({
        type: 'vector',
        queryable: true,
        sourceFields: [
          { name: 'name', alias: 'Alias name' },
          { name: 'description', alias: 'Alias description' }
        ]
      } as FeatureDataSourceOptions)
      .subscribe((dataSource: FeatureDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Vector layer',
            source: dataSource
          } as VectorLayerOptions)
        );
        this.addFeatures(dataSource);
      });

    // Couche Vector Tile
    this.layerService
      .createAsyncLayer({
        title: 'Vector tile with different query url',
        sourceOptions: {
          type: 'mvt',
          url: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/ne:ne_10m_admin_0_countries@EPSG:900913@pbf/{z}/{x}/{-y}.pbf',
          queryable: true,
          queryFormat: QueryFormat.HTMLGML2,
          queryHtmlTarget: QueryHtmlTarget.IFRAME,
          queryUrls: [
            {
              url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&BBOX={bbox}&CRS=EPSG%3A3857&WIDTH=900&HEIGHT=632&LAYERS=SDA_REGION_S_20K&STYLES=&FORMAT=image%2Fpng&QUERY_LAYERS=SDA_REGION_S_20K&INFO_FORMAT=text%2Fhtml&I=467&J=493'
            }
          ],
          queryLayerFeatures: false
        },
        mapboxStyle: {
          url: 'assets/mapboxStyleExample-vectortile.json',
          source: 'ahocevar'
        }
      } as VectorTileLayerOptions)
      .subscribe((layer: VectorTileLayer) => this.map.addLayer(layer));
  }

  addFeatures(dataSource: FeatureDataSource): void {
    const feature1: olFeature<olLineString> = new olFeature({
      name: 'feature1',
      geometry: new olLineString([
        olproj.transform([-72, 47.8], 'EPSG:4326', 'EPSG:3857'),
        olproj.transform([-73.5, 47.4], 'EPSG:4326', 'EPSG:3857'),
        olproj.transform([-72.4, 48.6], 'EPSG:4326', 'EPSG:3857')
      ])
    });

    const feature2: olFeature<olPoint> = new olFeature({
      name: 'feature2',
      geometry: new olPoint(
        olproj.transform([-73, 46.6], 'EPSG:4326', 'EPSG:3857')
      )
    });

    const feature3: olFeature<olPolygon> = new olFeature({
      name: 'feature3',
      geometry: new olPolygon([
        [
          olproj.transform([-71, 46.8], 'EPSG:4326', 'EPSG:3857'),
          olproj.transform([-73, 47], 'EPSG:4326', 'EPSG:3857'),
          olproj.transform([-71.2, 46.6], 'EPSG:4326', 'EPSG:3857')
        ]
      ])
    });

    dataSource.ol.addFeatures([feature1, feature2, feature3]);
  }

  handleQueryResults(results: any): void{
    const features: Feature[] = results.features;
    if (features.length && features[0]) {
      this.features$.next(features);
      this.map.queryResultsOverlay.setFeatures(features, FeatureMotion.None);
    }
  }

  getTitle(result: SearchResult): string {
    return getEntityTitle(result);
  }
}
