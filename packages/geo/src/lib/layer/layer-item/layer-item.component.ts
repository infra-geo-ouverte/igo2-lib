import {
  Component,
  Input,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subscription } from 'rxjs';

import olFormatGeoJSON from 'ol/format/GeoJSON';

import { MapService } from '../../map/shared/map.service';
// import { FeatureService } from '../../feature/shared/feature.service';
import { Layer, VectorLayer, VectorLayerOptions } from '../shared/layers';

@Component({
  selector: 'igo-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class LayerItemComponent implements OnDestroy {

  legendCollapsed = true;

  private resolution$$: Subscription;

  @Input()
  set layer(value: Layer) {
    this._layer = value;
    // TODO: This stuff should probably be in ngOnInit
    this.subscribeResolutionObserver();
    const legend = this.layer.dataSource.options.legend;
    if (legend && legend.collapsed) {
      this.legendCollapsed = legend.collapsed;
    }
  }
  get layer(): Layer { return this._layer; }
  private _layer: Layer;

  @Input() edition: boolean = false;

  @Input() color: string = 'primary';

  @Input() toggleLegendOnVisibilityChange: boolean = false;

  @Input() disableReorderLayers: boolean = false;

  get id(): string {
    const dataSourceOptions = this.layer.dataSource.options as any;
    return dataSourceOptions.id ? dataSourceOptions.id : this.layer.id;
  }

  get removable(): boolean { return this.layer.options.removable !== false; }

  get browsable(): boolean {
    const options = this.layer.options as any as VectorLayerOptions;
    return options.browsable !== false;
  }

  get opacity() { return this.layer.opacity * 100; }
  set opacity(opacity: number) { this.layer.opacity = opacity / 100; }

  constructor(
    // private featureService: FeatureService,
    private cdRef: ChangeDetectorRef,
    private mapService: MapService
  ) {}

  ngOnInit() {
    // TODO: This stuff should probably be in ngOnInit
    this.subscribeResolutionObserver();
    const legend = this.layer.dataSource.options.legend;
    if (legend && legend.collapsed) {
      this.legendCollapsed = legend.collapsed;
    }  
  }

  ngOnDestroy() {
    if (this.resolution$$ !== undefined) {
      this.resolution$$.unsubscribe();
    }
  }

  toggleLegend(collapsed: boolean) {
    if (collapsed === undefined) {
      return;
    }
    this.legendCollapsed = collapsed;
  }

  toggleVisibility() {
    this.layer.visible = !this.layer.visible;
    if (this.toggleLegendOnVisibilityChange) {
      this.toggleLegend(!this.layer.visible);
    }
  }

  showFeaturesList(layer: Layer) {
    return;

    // this.featureService.unfocusFeature();
    // this.featureService.unselectFeature();

    const map = this.mapService.getMap();
    const featuresOL = (layer.dataSource.ol as any).getFeatures();

    const format = new olFormatGeoJSON();
    const featuresGeoJSON = JSON.parse(
      format.writeFeatures(featuresOL, {
        dataProjection: 'EPSG:4326',
        featureProjection: map.projection
      })
    );

    let i = 0;
    const features = featuresGeoJSON.features.map(f =>
      Object.assign({}, f, {
        source: layer.title,
        id: layer.title + String(i++)
      })
    );

    // TODO: Restore that functionnality without using a global feature service
    // this.featureService.setFeatures(features);
  }

  isVectorLayer(val) {
    return val instanceof VectorLayer;
  }

  private subscribeResolutionObserver() {
    if (!this.layer || !this.layer.map) {
      return;
    }
    const resolution$ =  this.layer.map.viewController.resolution$;
    this.resolution$$ = resolution$.subscribe(resolution => {
      this.cdRef.detectChanges();
    });
  }
}
