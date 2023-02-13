import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';

import { SearchResult } from '../shared/search.interfaces';
import { IgoMap } from '../../map/shared/map';
import { LayerOptions } from '../../layer/shared/layers/layer.interface';
import { LayerService } from '../../layer/shared/layer.service';
import { LAYER } from '../../layer/shared/layer.enums';
import { Subscription, BehaviorSubject } from 'rxjs';
import { SaveFeatureDialogComponent } from './save-feature-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { FeatureDataSource } from '../../datasource';
import {
  FeatureMotion,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  tryAddLoadingStrategy,
  tryAddSelectionStrategy,
  tryBindStoreLayer
} from '../../feature';
import { CoordinatesUnit, FeatureWithDraw, FontType, LabelType } from '../../draw';
import { EntityStore } from '@igo2/common';
import { DrawStyleService } from '../../draw/shared/draw-style.service';
import { getTooltipsOfOlGeometry } from '../../measure';
import OlOverlay from 'ol/Overlay';
import { VectorSourceEvent as OlVectorSourceEvent } from 'ol/source/Vector';
import { default as OlGeometry } from 'ol/geom/Geometry';


@Component({
  selector: 'igo-search-add-button',
  templateUrl: './search-results-add-button.component.html',
  styleUrls: ['./search-results-add-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultAddButtonComponent implements OnInit, OnDestroy{
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

  @Input() stores: FeatureStore<FeatureWithDraw>[] = [];

  get allLayers() {
    return this.map.layers.filter((layer) =>
      layer.id.includes('igo-saved-layer')
    );
  }

  constructor(private layerService: LayerService,
    private dialog: MatDialog,
    private drawStyleService: DrawStyleService) {}

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

    const selectedFeature = this.layer;
    const dialogRef = this.dialog.open(SaveFeatureDialogComponent, {
      width: '700px',
      data: {
        feature: selectedFeature,
        layers: this.allLayers
      }
    });

    dialogRef.afterClosed().subscribe((data: {layer: string | any, feature: SearchResult}) => {
      if (data) {
        if(this.stores.length > 0) {
          this.stores.map((store) => {
            store.state.updateAll({selected: false});
            (store?.layer).visible = false;
            return store;
          });
        }
        // check if is new layer
        if (typeof data.layer === 'string') {
          this.createLayer(data.layer, data.feature);
        } else {
          const activeStore = this.stores.find(store => store.layer.id === data.layer.id);
          activeStore.layer.visible = true;
          activeStore.layer.opacity = 1;
          this.addFeature(data.feature, activeStore);
        }
      }
    });
  }

  createLayer(layerTitle: string, selectedFeature: SearchResult) {

    const activeStore: FeatureStore<FeatureWithDraw> = new FeatureStore<FeatureWithDraw>([], {
      map: this.map
    });

    // set layer id
    let layerCounterID: number = 0;
    for (const layer of this.allLayers) {
      let numberId = Number(layer.id.replace('igo-saved-layer',''));
      layerCounterID = Math.max(numberId,layerCounterID);
    }

    let activeDrawingLayer: VectorLayer = new VectorLayer({
      isIgoInternalLayer: true,
      id: 'igo-saved-layer' + ++layerCounterID,
      title: layerTitle,
      zIndex: 200,
      source: new FeatureDataSource(),
      style: (feature, resolution) => {
        return this.drawStyleService.createIndividualElementStyle(
          feature,
          resolution,
          true,
          feature.get('fontStyle'),
          feature.get('drawingStyle').fill,
          feature.get('drawingStyle').stroke,
          feature.get('offsetX'),
          feature.get('offsetY'),
          this.drawStyleService.getIcon()
        );
      },
      showInLayerList: true,
      exportable: true,
      browsable: false,
      workspace: {
        enabled: false
      }
    });

    tryBindStoreLayer(activeStore, activeDrawingLayer);
    tryAddLoadingStrategy(
      activeStore,
      new FeatureStoreLoadingStrategy({
        motion: FeatureMotion.None
      })
    );

    tryAddSelectionStrategy(
      activeStore,
      new FeatureStoreSelectionStrategy({
        map: this.map,
        motion: FeatureMotion.None,
        many: true
      })
    );

    activeStore.layer.visible = true;
    activeStore.source.ol.on(
      'removefeature',
      (event: OlVectorSourceEvent<OlGeometry>) => {
        const olGeometry = event.feature.getGeometry();
        this.clearLabelsOfOlGeometry(olGeometry);
      }
    );

    this.addFeature(selectedFeature, activeStore);
    this.stores.push(activeStore);
  }

  addFeature(feature: SearchResult, activeStore: FeatureStore<FeatureWithDraw>) {

    const newFeature = {
      type: feature.data.type,
      geometry: {
        coordinates: feature.data.geometry.coordinates,
        type: feature.data.geometry.type
      },
      projection: feature.data.projection,
      properties: {
        id: feature.meta.id,
        draw: feature.meta.title,
        longitude: feature.data.geometry.coordinates[0],
        latitude: feature.data.geometry.coordinates[1],
        rad: null,
        fontStyle: FontType.Arial,
        drawingStyle: {
          fill: 'rgba(255,255,255,0.4)',
          stroke: 'rgba(143,7,7,1)'
        },
        offsetX: 0,
        offsetY: -15,
        labelType: LabelType.Coordinates,
        measureUnit: CoordinatesUnit.DecimalDegree
      },
      meta: {
        id: feature.meta.id
      }
    };

    activeStore.update(newFeature);
    activeStore.setLayerExtent();
    activeStore.layer.ol.getSource().refresh();
  }

  private clearLabelsOfOlGeometry(olGeometry) {
    getTooltipsOfOlGeometry(olGeometry).forEach(
      (olTooltip: OlOverlay | undefined) => {
        if (olTooltip && olTooltip.getMap()) {
          this.map.ol.removeOverlay(olTooltip);
        }
      }
    );
  }
}
