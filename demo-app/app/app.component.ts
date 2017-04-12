import { Component, OnInit } from '@angular/core';

import { IgoMap, LayerService, QueryFormat,
         SearchService, WMSLayerOptions } from '../../lib/src';

@Component({
  selector: 'igo-demo',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent implements OnInit {

  public searchTerm: string;

  public map = new IgoMap();
  public mapView = {
    projection: 'EPSG:3857',
    center: [-72, 52],
    zoom: 6
  };

  constructor(public layerService: LayerService,
              public searchService: SearchService) {}

  ngOnInit() {
    this.map.removeLayers();

    this.layerService.createAsyncLayer({
      type: 'osm',
      title: 'OSM'
    }).subscribe(layer => this.map.addLayer(layer));

    this.layerService.createAsyncLayer({
      title: 'MSP DESSERTE MUN 911',
      type: 'wms',
      source: {
        url: '/cgi-wms/igo_gouvouvert.fcgi',
        params: {
          layers: 'MSP_DESSERTE_MUN_911',
          version: '1.3.0'
        },
        projection: 'EPSG:3857'
      },
      queryFormat: QueryFormat.GML2,
      queryTitle: 'Municipalite'
    } as WMSLayerOptions).subscribe(layer => this.map.addLayer(layer));

    this.layerService.createAsyncLayer({
      title: 'Embâcle',
      type: 'wms',
      source: {
        url: 'http://geoegl.msp.gouv.qc.ca/cgi-wms/igo_gouvouvert.fcgi',
        params: {
          layers: 'vg_observation_v_inondation_embacle_wmst',
          version: '1.3.0'
        },
        projection: 'EPSG:3857'
      },
      queryFormat: QueryFormat.GML2,
      queryTitle: 'Municipalite',
      timeFilter: {
        min: '2017-01-01',
        max: '2018-01-01',
        type: 'date',
        range: true
      }
    } as WMSLayerOptions).subscribe(layer => this.map.addLayer(layer));
  }

  handleSearch(term: string) {
    this.searchTerm = term;
  }
}
