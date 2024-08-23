import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoBadgeIconDirective } from '@igo2/common/badge';
import { EntityStore } from '@igo2/common/entity';
import { StopPropagationDirective } from '@igo2/common/stop-propagation';
import { IgoLanguageModule } from '@igo2/core/language';
import { Media, MediaService } from '@igo2/core/media';

import OlOverlay from 'ol/Overlay';
import { VectorSourceEvent as OlVectorSourceEvent } from 'ol/source/Vector';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

import { BehaviorSubject, Subscription, take } from 'rxjs';

import { DataSourceService } from '../../datasource/shared/datasource.service';
import { FeatureDataSource } from '../../datasource/shared/datasources';
import {
  Feature,
  FeatureMotion,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  tryAddLoadingStrategy,
  tryAddSelectionStrategy,
  tryBindStoreLayer
} from '../../feature';
import { LAYER } from '../../layer/shared/layer.enums';
import { LayerService } from '../../layer/shared/layer.service';
import { LayerOptions } from '../../layer/shared/layers/layer.interface';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { IgoMap } from '../../map/shared/map';
import { getTooltipsOfOlGeometry } from '../../measure';
import { QueryableDataSourceOptions } from '../../query/shared';
import { SearchResult } from '../shared/search.interfaces';
import { SaveFeatureDialogComponent } from './save-feature-dialog.component';

@Component({
  selector: 'igo-search-add-button',
  templateUrl: './search-results-add-button.component.html',
  styleUrls: ['./search-results-add-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    StopPropagationDirective,
    MatTooltipModule,
    MatIconModule,
    MatBadgeModule,
    IgoBadgeIconDirective,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class SearchResultAddButtonComponent implements OnInit, OnDestroy {
  public tooltip$ = new BehaviorSubject<string>(
    'igo.geo.catalog.layer.addToMap'
  );

  public addFeatureToLayerTooltip$ = new BehaviorSubject<string>(
    'igo.geo.search.addToLayer'
  );

  private resolution$$: Subscription;
  private layers$$: Subscription;

  public inRange$ = new BehaviorSubject<boolean>(true);

  public isVisible$ = new BehaviorSubject<boolean>(false);

  public isPreview$ = new BehaviorSubject<boolean>(false);

  private layersSubcriptions = [];

  private lastTimeoutRequest;

  private mouseInsideAdd = false;

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

  /**
   * show hide save search result in layer button
   */
  @Input() saveSearchResultInLayer = false;

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  @Input() stores: FeatureStore<Feature>[] = [];

  get allLayers() {
    return this.map.layers.filter((layer) =>
      String(layer.id).includes('igo-search-layer')
    );
  }
  private mediaService$$: Subscription;
  public isMobile = false;
  constructor(
    private layerService: LayerService,
    private dialog: MatDialog,
    private dataSourceService: DataSourceService,
    private mediaService: MediaService
  ) {}

  /**
   * @internal
   */
  ngOnInit(): void {
    // check the view if is mobile or not
    this.mediaService$$ = this.mediaService.media$.subscribe((media: Media) => {
      if (media === Media.Mobile) {
        this.isMobile = true;
      }
    });
    if (this.layer.meta.dataType === 'Layer') {
      this.added =
        this.map.layers.findIndex(
          (lay) => lay.id === this.layer.data.sourceOptions.id
        ) !== -1;
    }
    this.layers$$ = this.map.layers$.subscribe(() => {
      this.isVisible();
    });
    this.resolution$$ = this.map.viewController.resolution$.subscribe(
      (value) => {
        this.isInResolutionsRange(value);
        this.isVisible();
      }
    );
  }

  ngOnDestroy() {
    this.resolution$$.unsubscribe();
    this.layers$$.unsubscribe();
    if (this.mediaService$$) {
      this.mediaService$$.unsubscribe();
    }
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
  onToggleClick(currEvent: Event) {
    if (typeof this.lastTimeoutRequest !== 'undefined') {
      clearTimeout(this.lastTimeoutRequest);
    }
    const event = currEvent ? currEvent : ({} as Event);

    if (event.type === 'mouseenter' && this.mouseInsideAdd) {
      return;
    }
    switch (event.type) {
      case 'click':
        if (!this.isPreview$.value) {
          if (this.added) {
            this.remove();
          } else {
            this.add(event);
          }
        }
        this.isPreview$.next(false);
        break;
      case 'mouseenter':
        if (!this.isPreview$.value && !this.added) {
          this.lastTimeoutRequest = setTimeout(() => {
            this.add(event);
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

  private add(event: Event) {
    if (!this.added) {
      this.added = true;
      this.addLayerToMap(event);
    }
  }

  private remove() {
    if (this.added) {
      this.added = false;
      this.removeLayerFromMap();
      this.layersSubcriptions.map((s) => s.unsubscribe());
      this.layersSubcriptions = [];
    }
  }

  /**
   * Emit added change event with added = true
   */
  private addLayerToMap(event?: Event) {
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
      this.layerService.createAsyncLayer(layerOptions).subscribe((layer) => {
        if (event.type === 'click') {
          this.map.layersAddedByClick$.next([layer]);
        }
        this.map.addLayer(layer);
      })
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

  isVisible() {
    if (this.layer?.data?.sourceOptions?.id) {
      const oLayer = this.map.getLayerById(this.layer.data.sourceOptions.id);

      this.isVisible$.next(oLayer?.visible ?? false);
    }
  }

  getBadgeIcon() {
    if (this.inRange$.value) {
      return this.isVisible$.value ? '' : 'visibility_off';
    } else {
      return 'visibility_off';
    }
  }

  computeTooltip(): string {
    if (this.added) {
      if (this.isPreview$.value) {
        return 'igo.geo.catalog.layer.addToMap';
      } else if (this.inRange$.value) {
        return this.isVisible$.value
          ? 'igo.geo.catalog.layer.removeFromMap'
          : 'igo.geo.catalog.layer.removeFromMapNotVisible';
      } else {
        return 'igo.geo.catalog.layer.removeFromMapOutRange';
      }
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

    dialogRef
      .afterClosed()
      .subscribe((data: { layer: string | any; feature: SearchResult }) => {
        if (data) {
          if (this.stores.length > 0) {
            this.stores.map((store) => {
              store.state.updateAll({ selected: false });
              if (store?.layer) {
                store.layer.visible = false;
              }
              return store;
            });
          }
          // check if is new layer
          if (typeof data.layer === 'string') {
            this.createLayer(data.layer, data.feature);
          } else {
            const activeStore = this.stores.find(
              (store) => store.layer.id === data.layer.id
            );
            activeStore.layer.visible = true;
            activeStore.layer.opacity = 1;
            this.addFeature(data.feature, activeStore);
          }
        }
      });
  }

  createLayer(layerTitle: string, selectedFeature: SearchResult) {
    const activeStore: FeatureStore<Feature> = new FeatureStore<Feature>([], {
      map: this.map
    });

    const styles = [
      new Style({
        image: new Circle({
          radius: 5,
          stroke: new Stroke({
            width: 1,
            color: 'rgba(143,7,7,1)'
          }),
          fill: new Fill({
            color: 'rgba(143,7,7,1)'
          })
        })
      }),
      new Style({
        stroke: new Stroke({
          width: 1,
          color: 'rgba(143,7,7,1)'
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        })
      })
    ];

    // set layer id
    let layerCounterID = 0;
    for (const layer of this.allLayers) {
      const numberId = Number(layer.id.replace('igo-search-layer', ''));
      layerCounterID = Math.max(numberId, layerCounterID);
    }

    this.dataSourceService
      .createAsyncDataSource({
        type: 'vector',
        queryable: true
      } as QueryableDataSourceOptions)
      .pipe(take(1))
      .subscribe((dataSource: FeatureDataSource) => {
        const searchLayer: VectorLayer = new VectorLayer({
          isIgoInternalLayer: true,
          id: 'igo-search-layer' + ++layerCounterID,
          title: layerTitle,
          source: dataSource,
          igoStyle: {
            editable: false,
            igoStyleObject: {
              fill: { color: 'rgba(255,255,255,0.4)' },
              stroke: { color: 'rgba(143,7,7,1)', width: 1 },
              circle: {
                fill: { color: 'rgba(255,255,255,0.4)' },
                stroke: { color: 'rgba(143,7,7,1)', width: 1 },
                radius: 5
              }
            }
          },
          style: styles,
          showInLayerList: true,
          exportable: true,
          workspace: {
            enabled: true
          }
        });

        tryBindStoreLayer(activeStore, searchLayer);
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
          (event: OlVectorSourceEvent) => {
            const olGeometry = event.feature.getGeometry();
            this.clearLabelsOfOlGeometry(olGeometry);
          }
        );

        this.addFeature(selectedFeature, activeStore);
        this.stores.push(activeStore);
      });
  }

  addFeature(feature: SearchResult, activeStore: FeatureStore<Feature>) {
    const newFeature = {
      type: feature.data.type,
      geometry: {
        coordinates: feature.data.geometry.coordinates,
        type: feature.data.geometry.type
      },
      projection: feature.data.projection,
      properties: feature.data.properties,
      meta: {
        id: feature.meta.id
      }
    };
    delete newFeature.properties.Route;
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
