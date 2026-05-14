import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';

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

import { GeoJSON } from 'ol/format';

import { Style as GsStyle } from 'geostyler-style';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';
import './geostyler-wc.component';

interface GeostylerWebComponent extends HTMLElement {
  data?: object;
}

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
export class AppVectorDataStylingComponent implements OnInit {
  private layerService = inject(LayerService);
  private mapService = inject(MapService);
  private ngZone = inject(NgZone);
  @ViewChild('geostylerElement')
  geostylerElement: ElementRef<GeostylerWebComponent>;

  public structuresLayer: VectorLayer;

  private _geoStylerData: object | null = null;
  public get geoStylerData(): object | null {
    return this._geoStylerData;
  }
  public set geoStylerData(value: object | null) {
    this._geoStylerData = value;
    // Manually sync to web component element to ensure React component gets the update
    if (this.geostylerElement) {
      this.geostylerElement.nativeElement.data = value;
      console.log('Manually synced data to web component element:', value);
    }
  }
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

  ngOnInit() {
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

    this.structuresLayer = this.map.layerController.getByTitle('Structures') as
      | VectorLayer
      | undefined;

    if (!this.structuresLayer) {
      console.warn('Structures layer not found');
      return;
    }

    this.structuresLayer.dataSource.ol.once('featuresloadend', () => {
      const features = this.structuresLayer.dataSource.ol.getFeatures();
      if (features) console.log('Features loaded:', features.length);

      const geojson = new GeoJSON().writeFeaturesObject(features); // todo:
      console.log('GeoJSON data:', geojson);

      // OpenLayers events can fire outside Angular zone; re-enter zone to update bindings.
      this.ngZone.run(() => {
        this.geoStylerData = geojson;
      });
    });
  }

  handleStyleChange = (newStyle: GsStyle) => {
    this.style = newStyle;

    // Update the layer's style property, which triggers the style service
    // to convert Geostyler format to OpenLayers style and apply it
    this.structuresLayer.style = {
      type: 'Geostyler',
      style: newStyle
    };
  };
}
