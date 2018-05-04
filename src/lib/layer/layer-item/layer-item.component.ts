import {
  Component,
  Input,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import * as ol from 'openlayers';

import { MapService } from '../../map/shared/map.service';
import { FeatureService } from '../../feature';
import { OgcFilterableDataSourceOptions } from '../../datasource';
import { MetadataService, MetadataOptions } from '../../metadata';
import { DownloadService } from '../../download';
import { Layer, VectorLayer } from '../shared/layers';

@Component({
  selector: 'igo-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.styl'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class LayerItemComponent implements OnDestroy {
  @Input()
  get layer(): Layer {
    return this._layer;
  }
  set layer(value: Layer) {
    this._layer = value;
    this.subscribeResolutionObserver();
  }
  private _layer: Layer;

  @Input()
  get edition() {
    return this._edition;
  }
  set edition(value: boolean) {
    this._edition = value;
  }
  private _edition: boolean = false;

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color: string = 'primary';

  @Input()
  get toggleLegendOnVisibilityChange() {
    return this._toggleLegendOnVisibilityChange;
  }
  set toggleLegendOnVisibilityChange(value: boolean) {
    this._toggleLegendOnVisibilityChange = value;
  }
  private _toggleLegendOnVisibilityChange: boolean = false;

  @Input()
  get ogcFilterInLayerItem() {
    return this._ogcFilterInLayers;
  }
  set ogcFilterInLayerItem(value: boolean) {
    this._ogcFilterInLayers = value;
  }
  private _ogcFilterInLayers: boolean = false;

  get opacity() {
    return this.layer.opacity * 100;
  }

  set opacity(opacity: number) {
    this.layer.opacity = opacity / 100;
  }

  get id(): string {
    return this.layer.dataSource.options['id']
      ? this.layer.dataSource.options['id']
      : this.layer.id;
  }

  get ogcFilterableOptions(): OgcFilterableDataSourceOptions {
    return this.layer.dataSource.options;
  }

  public legendLoaded = false;
  public ogcFilterCollapse = false;
  private resolution$$: Subscription;

  constructor(
    private cdRef: ChangeDetectorRef,
    private mapService: MapService,
    private featureService: FeatureService,
    private metadataService: MetadataService,
    private downloadService: DownloadService
  ) {}

  ngOnDestroy() {
    this.resolution$$.unsubscribe();
  }

  toggleLegend(collapsed: boolean) {
    this.layer.collapsed = collapsed;
    this.legendLoaded = collapsed ? this.legendLoaded : true;
  }

  toggleVisibility() {
    this.layer.visible = !this.layer.visible;
    if (this.toggleLegendOnVisibilityChange) {
      this.toggleLegend(!this.layer.visible);
    }
  }
  toggleOgcFilter() {
    if (this.layer.isInResolutionsRange) {
      this.ogcFilterCollapse = !this.ogcFilterCollapse;
    }
  }

  openMetadata(metadata: MetadataOptions) {
    this.metadataService.open(metadata);
  }

  openDownload(layer: Layer) {
    this.downloadService.open(layer);
  }

  showFeaturesList(layer: Layer) {
    this.featureService.unfocusFeature();
    this.featureService.unselectFeature();

    const map = this.mapService.getMap();
    const featuresOL = (layer.dataSource.ol as any).getFeatures();

    const format = new ol.format.GeoJSON();
    const featuresGeoJSON = JSON.parse(
      format.writeFeatures(featuresOL, {
        dataProjection: 'EPSG:4326',
        featureProjection: map.projection
      })
    );

    let i = 0;
    const features = featuresGeoJSON.features.map(f =>
      Object.assign({}, f, {
        source: layer.dataSource.title,
        id: layer.dataSource.title + String(i++)
      })
    );

    this.featureService.setFeatures(features);
  }

  isVectorLayer(val) {
    return val instanceof VectorLayer;
  }

  private subscribeResolutionObserver() {
    if (!this.layer || !this.layer.map) {
      return;
    }
    this.resolution$$ = this.layer.map.resolution$.subscribe(resolution => {
      this.cdRef.detectChanges();
    });
  }
}
