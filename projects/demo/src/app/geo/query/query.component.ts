import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';

import { IgoPanelModule, getEntityTitle } from '@igo2/common';
import {
  DataSourceService,
  Feature,
  FeatureDataSource,
  FeatureMotion,
  IgoFeatureDetailsModule,
  IgoMap,
  IgoMapModule,
  IgoOverlayModule,
  IgoQueryModule,
  LayerService,
  QueryFormat,
  QueryHtmlTarget,
  QueryableDataSourceOptions,
  SearchResult
} from '@igo2/geo';

import olFeature from 'ol/Feature';
import olLineString from 'ol/geom/LineString';
import olPoint from 'ol/geom/Point';
import olPolygon from 'ol/geom/Polygon';
import * as olproj from 'ol/proj';

import { BehaviorSubject } from 'rxjs';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    IgoMapModule,
    IgoOverlayModule,
    IgoQueryModule,
    IgoPanelModule,
    NgIf,
    NgFor,
    IgoFeatureDetailsModule,
    AsyncPipe
  ]
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
      })
      .subscribe((dataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource
          })
        );
      });

    this.dataSourceService
      .createAsyncDataSource({
        type: 'wms',
        url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
        queryable: true,
        queryTitle: 'num_rts',
        params: {
          layers: 'bgr_v_sous_route_res_sup_act',
          version: '1.3.0'
        }
      } as QueryableDataSourceOptions)
      .subscribe((dataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'WMS',
            source: dataSource,
            sourceOptions: dataSource.options
          })
        );
      });

    this.dataSourceService
      .createAsyncDataSource({
        type: 'wms',
        url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
        queryable: true,
        queryFormat: QueryFormat.HTMLGML2,
        queryHtmlTarget: QueryHtmlTarget.IFRAME,
        params: {
          layers: 'bgr_v_sous_route_res_sup_act',
          version: '1.3.0'
        }
      } as QueryableDataSourceOptions)
      .subscribe((dataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'WMS html with a pre call in GML',
            source: dataSource,
            sourceOptions: dataSource.options
          })
        );
      });

    this.layerService
      .createAsyncLayer({
        title: 'Query url test',
        visible: true,
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/all.fcgi',
          queryable: true,
          queryUrls: [
            {
              url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/amenagement.fcgi?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=wms_mern_reg_admin&LAYERS=wms_mern_reg_admin&INFO_FORMAT=application/geojson&FEATURE_COUNT=20&I=50&J=50&CRS=EPSG%3A3857&STYLES=&WIDTH=101&HEIGHT=101&BBOX={bbox}'
            }
          ],
          queryLayerFeatures: false,
          queryFormat: 'geojson',
          params: {
            layers: 'SDA_MUNIC_S_20K',
            version: '1.3.0'
          }
        }
      } as any)
      .subscribe((l) => this.map.addLayer(l));

    this.dataSourceService
      .createAsyncDataSource({
        type: 'vector',
        queryable: true,
        queryTitle: 'So beautiful ${name}',
        sourceFields: [
          { name: 'name', alias: 'Alias name' },
          { name: 'description', alias: 'Alias description' }
        ]
      } as QueryableDataSourceOptions)
      .subscribe((dataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Vector Layer',
            source: dataSource,
            sourceOptions: dataSource.options
          })
        );
        this.addFeatures(dataSource as FeatureDataSource);
      });
  }

  addFeatures(dataSource: FeatureDataSource) {
    const feature1 = new olFeature({
      name: 'feature1',
      geometry: new olLineString([
        olproj.transform([-72, 47.8], 'EPSG:4326', 'EPSG:3857'),
        olproj.transform([-73.5, 47.4], 'EPSG:4326', 'EPSG:3857'),
        olproj.transform([-72.4, 48.6], 'EPSG:4326', 'EPSG:3857')
      ])
    });

    const feature2 = new olFeature({
      name: 'feature2',
      geometry: new olPoint(
        olproj.transform([-73, 46.6], 'EPSG:4326', 'EPSG:3857')
      )
    });

    const feature3 = new olFeature({
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

    this.layerService
      .createAsyncLayer({
        title: 'Vector tile with custom getfeatureinfo url',
        visible: true,
        sourceOptions: {
          type: 'mvt',
          url: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/ne:ne_10m_admin_0_countries@EPSG:900913@pbf/{z}/{x}/{-y}.pbf',
          queryable: true,
          queryUrls: [
            {
              url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/amenagement.fcgi?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=wms_mern_reg_admin&LAYERS=wms_mern_reg_admin&INFO_FORMAT=application%2Fgeojson&FEATURE_COUNT=20&I=50&J=50&CRS=EPSG%3A3857&STYLES=&WIDTH=101&HEIGHT=101&BBOX={bbox}'
            }
          ],
          queryLayerFeatures: false
          // queryFormat: 'geojson'
        },
        mapboxStyle: {
          url: 'assets/mapboxStyleExample-vectortile.json',
          source: 'ahocevar'
        }
      } as any)
      .subscribe((l) => this.map.addLayer(l));

    this.dataSourceService
      .createAsyncDataSource({
        type: 'wms',
        url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/incendie.fcgi',
        queryable: true,
        queryUrls: [
          {
            url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/amenagement.fcgi?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=SDA_MUNIC_S_20K&LAYERS=SDA_MUNIC_S_20K&INFO_FORMAT=geojson&FEATURE_COUNT=20&I=50&J=50&CRS=EPSG%3A3857&STYLES=&WIDTH=101&HEIGHT=101&BBOX={bbox}',
            // minScale: 20000,
            // maxScale: 9000000,
            minResolution: 0,
            maxResolution: 400
          }
        ],
        queryFormat: 'geojson',
        params: {
          version: '1.3.0',
          layers: 'MSP_CASERNE_PUBLIC'
        }
      } as QueryableDataSourceOptions)
      .subscribe((dataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'WMS with custom getfeatureinfo url',
            source: dataSource,
            sourceOptions: dataSource.options
          })
        );
      });
  }

  handleQueryResults(results) {
    const features: Feature[] = results.features;
    if (features.length && features[0]) {
      this.features$.next(features);
      this.map.queryResultsOverlay.setFeatures(features, FeatureMotion.None);
    }
  }

  getTitle(result: SearchResult) {
    return getEntityTitle(result);
  }
}
