
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { EntityStore, ToolComponent } from '@igo2/common';
import { FeatureForPredefinedOrDrawGeometry, FeatureStore, Layer, SpatialType
} from '@igo2/geo';
import { MapState } from '../map.state';

@ToolComponent({
  name: 'advancedMap',
  title: 'igo.integration.tools.advancedMap',
  icon: 'toolbox'
})

/**
 * Tool to handle the advanced map tools
 */
@Component({
  selector: 'igo-advanced-map-tool',
  templateUrl: './advanced-map-tool.component.html',
  styleUrls: ['./advanced-map-tool.component.scss']
})

export class AdvancedMapToolComponent implements OnInit {

  @Input() type: SpatialType;
  @Input() geometryTypes: string[] = ['Point', 'LineString', 'Polygon'];

  public predefinedRegionsStore: EntityStore<FeatureForPredefinedOrDrawGeometry> = new EntityStore<FeatureForPredefinedOrDrawGeometry>([]);
  public allRegionsStore: FeatureStore<FeatureForPredefinedOrDrawGeometry> =
    new FeatureStore<FeatureForPredefinedOrDrawGeometry>([], { map: this.mapState.map });
  public currentRegionStore: FeatureStore<FeatureForPredefinedOrDrawGeometry> =
    new FeatureStore<FeatureForPredefinedOrDrawGeometry>([], { map: this.mapState.map });
  public predefinedTypes: string[] = ['type1', 'type2'];
  public selectedPredefinedType = 'type1';
  public layers: Layer[];
  public activeLayers: Layer[] = [];
  public allRegionsFeatures = [];

  constructor(
    public mapState: MapState, private http: HttpClient
  ) { }
  ngOnInit(): void {

    this.allRegionsStore.load([
      {
        meta: { id: 1 },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-72, 47.8]
        },
        projection: 'EPSG:4326',
        properties: {
          id: 1,
          title: 'Name 1',
          _predefinedType: 'type1'
        }
      },
      {
        meta: { id: 2 },
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[-72, 47.8], [-73.5, 47.4], [-72.4, 48.6]]
        },
        projection: 'EPSG:4326',
        properties: {
          id: 2,
          title: 'Name 2',
          _predefinedType: 'type1'
        }
      },
      {
        meta: { id: 3 },
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-71, 46.8], [-73, 47], [-71.2, 46.6],[-71, 46.8]]]
        },
        projection: 'EPSG:4326',
        properties: {
          id: 3,
          title: 'Name 3',
          _predefinedType: 'type2'
        }
      }
    ]);
  }

  onPredefinedTypeChange(event) {
    this.selectedPredefinedType = event;
    this.handlePredefinedType();
  }


  handlePredefinedType() {
    let f = [];
    switch (this.selectedPredefinedType) {
      case 'type1':
        f = this.allRegionsStore.entities$.value.filter(f => f.properties._predefinedType === 'type1');
        break;
      case 'type2':
        f = this.allRegionsStore.entities$.value.filter(f => f.properties._predefinedType === 'type2');
        break;
      default:
        this.predefinedRegionsStore.clear();
        break;
    }
    this.predefinedRegionsStore.clear();
    this.predefinedRegionsStore.insertMany(f);
  }


}

