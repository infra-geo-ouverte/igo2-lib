import { CUSTOM_ELEMENTS_SCHEMA, Component, inject } from '@angular/core';

import {
    AnyLayerOptions,
    IgoMap,
    LayerService,
    MapBrowserComponent,
    MapService,
    MapViewOptions,
    VectorLayer,
    ZoomButtonComponent
} from '@igo2/geo';

import { Style as GsStyle } from 'geostyler-style';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';
import './geostyler-wc.component';

@Component({
  selector: 'app-vector-data-styling',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    ExampleViewerComponent,
    DocViewerComponent,
    MapBrowserComponent,
    ZoomButtonComponent
  ],
  templateUrl: './vector-data-styling.component.html',
  styleUrl: './vector-data-styling.component.scss'
})
export class AppVectorDataStylingComponent {
  private layerService = inject(LayerService);
  private mapService = inject(MapService);
  public name: string = 'Hello WorDld';
  public style: GsStyle = {
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

  constructor() {
    this.mapService.setMap(this.map);
    const structuresStyle = {
      type: 'Geostyler' as const,
      style: this.style
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

    this.layerService
      .createLayers(layers)
      .subscribe((layers) => this.map.layerController.add(...layers));

    // console.log(
    //   (this.map.layerController.getByTitle('Structures') as VectorLayer).style
    // );
  }

  handleStyleChange = (newStyle: GsStyle) => {
    this.style = newStyle;

    const structuresLayer = this.map.layerController.getByTitle(
      'Structures'
    ) as VectorLayer | undefined;

    if (!structuresLayer) {
      console.warn('Structures layer not found');
      return;
    }

    // Update the layer's style property, which triggers the style service
    // to convert Geostyler format to OpenLayers style and apply it
    structuresLayer.style = {
      type: 'Geostyler',
      style: newStyle
    };
  };
}
