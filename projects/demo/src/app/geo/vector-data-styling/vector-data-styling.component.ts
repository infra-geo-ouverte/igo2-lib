import { Component, OnInit, inject } from '@angular/core';

import {
  AnyLayerOptions,
  IgoMap,
  LayerService,
  LayerStylingComponent,
  MapBrowserComponent,
  MapService,
  MapViewOptions,
  VectorLayer,
  ZoomButtonComponent
} from '@igo2/geo';

import { GeoJSON } from 'ol/format';

import { Style as GsStyle } from 'geostyler-style';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-vector-data-styling',
  imports: [
    ExampleViewerComponent,
    DocViewerComponent,
    MapBrowserComponent,
    ZoomButtonComponent,
    LayerStylingComponent
  ],
  templateUrl: './vector-data-styling.component.html',
  styleUrl: './vector-data-styling.component.scss'
})
export class AppVectorDataStylingComponent implements OnInit {
  private layerService = inject(LayerService);
  private mapService = inject(MapService);

  public structuresLayer: VectorLayer | undefined;
  public initialStyle: GsStyle = {
    name: 'My Style',
    rules: [
      {
        name: 'Default',
        symbolizers: [
          { kind: 'Line', color: '#0f16e7', width: 2, opacity: 1 },
          { kind: 'Fill', color: '#0f16e7', fillOpacity: 0.25 },
          {
            kind: 'Mark',
            wellKnownName: 'circle',
            color: '#0f16e7',
            radius: 6,
            strokeColor: '#ffffff',
            strokeWidth: 1
          }
        ]
      }
    ]
  };

  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      },
      scaleLine: true
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 6,
    projection: 'EPSG:3857'
  };

  ngOnInit() {
    this.mapService.setMap(this.map);
    const structuresStyle = {
      type: 'Geostyler' as const,
      style: this.initialStyle
    };

    const layers: AnyLayerOptions[] = [
      {
        title: 'OSM',
        sourceOptions: {
          type: 'osm'
        },
        baseLayer: true,
        visible: true
      },
      {
        title: 'Structures',
        style: structuresStyle,
        sourceOptions: {
          type: 'vector',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq?service=wfs&version=2.0.0&request=getfeature&typename=ms:gsq_v_desc_strct_tri&outfile=Structure&srsname=EPSG:4326&outputformat=geojson'
        }
      }
    ];

    this.layerService.createLayers(layers).subscribe((layers) => {
      this.map.layerController.add(...layers);
      this.structuresLayer = this.map.layerController.getByTitle(
        'Structures'
      ) as VectorLayer | undefined;
    });

    this.structuresLayer.dataSource.ol.once('featuresloadend', () => {
      const features = this.structuresLayer.dataSource.ol.getFeatures();
      if (features) console.log('Features loaded:', features.length);

      const geojson = new GeoJSON().writeFeaturesObject(features); // todo:
      console.log('GeoJSON data:', geojson);
    });
  }
}
