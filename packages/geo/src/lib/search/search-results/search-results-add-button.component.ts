import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';

import { SearchResult } from '../shared/search.interfaces';
import { IgoMap } from '../../map/shared/map';
import { LayerOptions } from '../../layer/shared/layers/layer.interface';
import { LayerService } from '../../layer/shared/layer.service';
import { LAYER } from '../../layer/shared/layer.enums';
import { Subscription, BehaviorSubject } from 'rxjs';
import { SaveFeatureDialogComponent } from './save-feature-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import Layer from 'ol/layer/Layer';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { FeatureDataSource } from '../../datasource';
import { FeatureStore } from '../../feature';
import { FeatureWithDraw } from '../../draw';
import { EntityStore } from '@igo2/common';
import olFeature from 'ol/Feature';

@Component({
  selector: 'igo-search-add-button',
  templateUrl: './search-results-add-button.component.html',
  styleUrls: ['./search-results-add-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultAddButtonComponent implements OnInit, OnDestroy {
  public tooltip$: BehaviorSubject<string> = new BehaviorSubject(
    'igo.geo.catalog.layer.addToMap'
  );

  public exportTooltip$: BehaviorSubject<string> = new BehaviorSubject(
    'igo.geo.catalog.feature.addToLayar'
  );

  private resolution$$: Subscription;

  public inRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  public isPreview$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private layersSubcriptions = [];

  private lastTimeoutRequest;

  private mouseInsideAdd: boolean = false;

  @Input() layer: SearchResult;

  @Input() store: EntityStore<SearchResult>;

  /**
   * Whether the layer is already added to the map
   */
  @Input() added: boolean;

  /**
   * The map to add the search result layer to
   */
  @Input() map: IgoMap;

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  /**
   * Event emitted when a result is added
   */
  @Output() addFeaturesToLayer = new EventEmitter<SearchResult>();

  constructor(private layerService: LayerService, private dialog: MatDialog) {}

  /**
   * @internal
   */
  ngOnInit(): void {
    if (this.layer.meta.dataType === 'Layer') {
      this.added =
        this.map.layers.findIndex(
          lay => lay.id === this.layer.data.sourceOptions.id
        ) !== -1;
    }
    this.resolution$$ = this.map.viewController.resolution$.subscribe(value => {
      this.isInResolutionsRange(value);
      this.tooltip$.next(this.computeTooltip());
    });
  }

  ngOnDestroy() {
    this.resolution$$.unsubscribe();
  }

  /**
   * On mouse event, mouseenter /mouseleave
   * @internal
   */
  onMouseEvent(event) {
    this.onToggleClick(event);
  }

  /**
   * On toggle button click, emit the added change event
   * @internal
   */
  onToggleClick(event) {
    if (typeof this.lastTimeoutRequest !== 'undefined') {
      clearTimeout(this.lastTimeoutRequest);
    }

    if (event.type === 'mouseenter' && this.mouseInsideAdd ) {
      return;
    }
    switch (event.type) {
      case 'click':
        if (!this.isPreview$.value) {
          if (this.added) {
            this.remove();
          } else {
            this.add();
          }
        }
        this.isPreview$.next(false);
        break;
      case 'mouseenter':
        if (!this.isPreview$.value && !this.added) {
          this.lastTimeoutRequest = setTimeout(() => {
            this.add();
            this.isPreview$.next(true);
          }, 500);
        }
        this.mouseInsideAdd = true;
        break;
      case 'mouseleave':
        if (this.isPreview$.value) {
          this.remove();
          this.isPreview$.next(false);
        }
        this.mouseInsideAdd = false;
        break;
      default:
        break;
    }
  }

  private add() {
    if (!this.added) {
      this.added = true;
      this.addLayerToMap();
    }
  }

  private remove() {
    if (this.added) {
      this.added = false;
      this.removeLayerFromMap();
      this.layersSubcriptions.map(s => s.unsubscribe());
      this.layersSubcriptions = [];
    }
  }

  /**
   * Emit added change event with added = true
   */
  private addLayerToMap() {
    if (this.map === undefined) {
      return;
    }

    if (this.layer.meta.dataType !== LAYER) {
      return undefined;
    }

    const layerOptions = (this.layer as SearchResult<LayerOptions>).data;
    if (layerOptions.sourceOptions.optionsFromApi === undefined) {
      layerOptions.sourceOptions.optionsFromApi = true;
    }
    this.layersSubcriptions.push(
      this.layerService
        .createAsyncLayer(layerOptions)
        .subscribe(layer => this.map.addLayer(layer))
    );
  }

  /**
   * Emit added change event with added = false
   */
  private removeLayerFromMap() {
    if (this.map === undefined) {
      return;
    }

    if (this.layer.meta.dataType !== LAYER) {
      return undefined;
    }

    const oLayer = this.map.getLayerById(this.layer.data.sourceOptions.id);
    this.map.removeLayer(oLayer);
  }

  isInResolutionsRange(resolution: number) {
    const minResolution = this.layer.data.minResolution || 0;
    const maxResolution = this.layer.data.maxResolution || Infinity;
    this.inRange$.next(
      resolution >= minResolution && resolution <= maxResolution
    );
  }

  computeTooltip(): string {
    if (this.added) {
      return this.inRange$.value
        ? 'igo.geo.catalog.layer.removeFromMap'
        : 'igo.geo.catalog.layer.removeFromMapOutRange';
    } else {
      return this.inRange$.value
        ? 'igo.geo.catalog.layer.addToMap'
        : 'igo.geo.catalog.layer.addToMapOutRange';
    }
  }

  addFeatureToLayer() {
    if (this.layer.meta.dataType !== 'Feature') {
      return;
    }

    let activeStore = new FeatureStore<FeatureWithDraw>([], {
      map: this.map
    });

    this.added = !this.added;
    this.isPreview$.next(false);
    const dialogRef = this.dialog.open(SaveFeatureDialogComponent, {
      width: '700px',
      data: {
        feature: this.layer,
        layers: this.map.layers
      }
    });



    dialogRef.afterClosed().subscribe((data: {layer: string | Layer, feature: SearchResult}) => {
      this.added = false;
      let activeDrawingLayer: VectorLayer;
      if(data) { 
        
        console.log('after close');
        // check if is new layer
        if(typeof data.layer === 'string') {
          console.log('create new layer and add future');
          this.createNewLayer(data.layer, data.feature);
        } else {
          // else use existing layer
          console.log('add future to choosen layer');
          this.editLayer(data.layer, data.feature);
          
        }
      }
    });
  }

  createNewLayer(layerName: string, feature: SearchResult) {
    console.log("createNewLayer: ", feature);
    const source = new FeatureDataSource();
    const feature1 = new olFeature({})
    source.ol.addFeature(feature1);
    let newLayer = this.layerService.createLayer({
      title: layerName,
      source: source,
      showInLayerList: true,
    });
    // console.log(newLayer.options.source.ol.u);

    this.map.addLayer(newLayer);

    //source.ol.addFeature(feature)
    // newLayer.ol.addFeature


  }

  editLayer(layer: Layer, feature: SearchResult) {
    const featureDate = {
      type: feature.data.type,
      geometry: feature.data.geometry,
      projection: feature.data.projection,
      properties: feature.data.properties,
      meta: feature.data.meta
    }

    console.log('featureDate: ', featureDate);

    // this.activeStore.setLayerFeatures([featureDate])
    // this.activeStore.layer.ol.getFeatures()
    // this.activeStore.update(featureDate);
    // console.log('selected layer', layer);
    // console.log('selected feature', feature);
  }
}
