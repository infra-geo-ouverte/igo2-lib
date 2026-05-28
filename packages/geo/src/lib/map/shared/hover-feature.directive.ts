import {
  Directive,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  input
} from '@angular/core';

import { MediaService } from '@igo2/core/media';
import { SubjectStatus } from '@igo2/utils';

import OlFeature from 'ol/Feature';
import type { default as OlMapBrowserEvent } from 'ol/MapBrowserEvent';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import Geometry from 'ol/geom/Geometry';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import RenderFeature from 'ol/render/Feature';

import { getUid } from 'ol';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, filter, first } from 'rxjs/operators';

import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { tryBindStoreLayer } from '../../feature/shared/feature-store.utils';
import { FeatureMotion } from '../../feature/shared/feature.enums';
import type { Feature } from '../../feature/shared/feature.interfaces';
import { FeatureStore } from '../../feature/shared/store';
import { LayerService } from '../../layer/shared/layer.service';
import {
  VectorLayer,
  VectorLayerOptions,
  VectorTileLayer
} from '../../layer/shared/layers';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { IgoMap } from '../../map/shared/map';
import { nearTransparentOlStyle } from '../../style/shared/style.utils';

/**
 * HoverFeatureDirective
 *
 * Debounces map pointer move events and highlights the top-most processable
 * feature under the pointer. The hovered feature is copied to an internal
 * overlay layer and marked with `_hovered` so layer styles can render hover
 * symbolizers and labels.
 */
@Directive({
  selector: '[igoHoverFeature]'
})
export class HoverFeatureDirective implements OnInit, OnDestroy {
  private component = inject(MapBrowserComponent, { self: true });
  private layerService = inject(LayerService);
  private mediaService = inject(MediaService);
  private store: FeatureStore | undefined;
  private pointerMoveSubscription$$: Subscription | undefined;

  private readonly hoverLayerId = 'hoverFeatureId';
  /**
   * Delay (ms) before applying hover once the pointer is motionless.
   */
  readonly igoHoverFeatureDelay = input(500);
  readonly igoHoverFeatureTolerance = input(10);

  /**
   * If the user has enabled or not the directive
   */
  readonly igoHoverFeatureEnabled = input(false);

  @HostListener('mouseout')
  mouseout() {
    this.clearLayer();
  }

  /**
   * IGO map
   * @internal
   */
  get map(): IgoMap {
    return this.component.map();
  }

  ngOnInit() {
    this.map.status$
      .pipe(first((status) => status === SubjectStatus.Done))
      .subscribe(() => {
        this.initStore();
        this.listenToMapPointerMove();
      });
  }
  /**
   * Initialize the hover store
   * @internal
   */
  private initStore(): void {
    if (this.store) {
      return;
    }

    this.store = new FeatureStore<Feature>([], {
      map: this.map
    });
    const hoverLayer = this.layerService.createLayer({
      isIgoInternalLayer: true,
      id: this.hoverLayerId,
      title: 'hoverFeature',
      zIndex: 900,
      source: new FeatureDataSource(),
      showInLayerList: false,
      exportable: false,
      browsable: false
    } satisfies VectorLayerOptions) as VectorLayer;

    tryBindStoreLayer(this.store, hoverLayer);
  }

  ngOnDestroy() {
    this.clearLayer();
    this.removeHoverLayer();
    this.pointerMoveSubscription$$?.unsubscribe();
  }

  /**
   * Listen to pointer move events and debounce hover processing.
   */
  private listenToMapPointerMove() {
    this.pointerMoveSubscription$$ = fromEvent<OlMapBrowserEvent>(
      this.map.ol,
      'pointermove'
    )
      .pipe(
        filter(
          (event: OlMapBrowserEvent) =>
            !event.dragging &&
            this.igoHoverFeatureEnabled() &&
            !this.mediaService.isTouchScreen()
        ),
        debounceTime(this.igoHoverFeatureDelay())
      )
      .subscribe((event: OlMapBrowserEvent) => this.onMapEvent(event));
  }

  /**
   * Apply hover rendering for the top-most processable feature at the pointer.
   * @param event OL map browser pointer event
   */
  private onMapEvent(event: OlMapBrowserEvent) {
    this.clearLayer();

    const store = this.store;
    if (!store?.layer) {
      return;
    }

    const topMostHit = this.getTopMostHitAtPixel(event.pixel);
    if (!topMostHit) {
      return;
    }

    store.layer.style = topMostHit.layer.style ?? nearTransparentOlStyle();
    const hoveredFeature = this.handleRenderFeature(topMostHit.feature);
    store.setLayerOlFeatures([hoveredFeature], FeatureMotion.None);
  }

  private getTopMostHitAtPixel(pixel: number[]):
    | {
        feature: RenderFeature | OlFeature<OlGeometry>;
        layer: VectorLayer | VectorTileLayer;
      }
    | undefined {
    return this.map.ol.forEachFeatureAtPixel(
      pixel,
      (mapFeature: RenderFeature | OlFeature<OlGeometry>, layerOL: unknown) => {
        const topMostOlLayer = this.getProcessableLayer(layerOL);
        if (!topMostOlLayer) {
          return undefined;
        }

        return { feature: mapFeature, layer: topMostOlLayer };
      },
      {
        hitTolerance: this.igoHoverFeatureTolerance(),
        layerFilter: (olLayer) => !!this.getProcessableLayer(olLayer)
      }
    ) as
      | {
          feature: RenderFeature | OlFeature<OlGeometry>;
          layer: VectorLayer | VectorTileLayer;
        }
      | undefined;
  }

  private getProcessableLayer(
    olLayer: unknown
  ): VectorLayer | VectorTileLayer | undefined {
    if (!olLayer) {
      return undefined;
    }

    const layer = this.map.getLayerByOlUId(getUid(olLayer)) as
      | VectorLayer
      | VectorTileLayer
      | undefined;

    if (!layer || !layer.visible || layer.isIgoInternalLayer) {
      return undefined;
    }

    return layer;
  }

  private handleRenderFeature(
    feature: RenderFeature | OlFeature<OlGeometry>
  ): OlFeature<OlGeometry> {
    let localFeature: OlFeature<OlGeometry>;
    if (feature instanceof RenderFeature) {
      localFeature = new OlFeature({
        geometry: this.getGeometry(feature)
      });
      localFeature.setId(feature.getId());
    } else if (feature instanceof OlFeature) {
      localFeature = feature.clone();
    }
    localFeature!.setProperties(feature.getProperties());
    localFeature!.set('_hovered', true);
    return localFeature!;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getGeometry(feature: any): Geometry {
    let geom;
    if (!feature.getOrientedFlatCoordinates) {
      geom = feature.getGeometry();
    } else {
      const coords = feature.getOrientedFlatCoordinates();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flatCoords: any[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      coords.forEach((c: any, idx: any) => {
        if (idx % 2 === 0) {
          flatCoords.push([
            parseFloat(coords[idx]),
            parseFloat(coords[idx + 1])
          ]);
        }
      });

      // TODO: test MultiX
      switch (feature.getType()) {
        case 'Point':
          geom = new Point(flatCoords);
          break;
        case 'Polygon':
          geom = new Polygon([flatCoords]);
          break;
        case 'LineString':
          geom = new LineString([flatCoords]);
          break;
      }
    }

    return geom;
  }

  /**
   * Clear the hover store features
   */
  private clearLayer(): void {
    if (!this.store?.layer) {
      return;
    }

    this.store.clearLayer();
    this.store.layer.style = nearTransparentOlStyle();
  }

  private removeHoverLayer(): void {
    if (!this.store?.layer) {
      return;
    }

    this.map.layerController.remove(this.store.layer);
  }
}
