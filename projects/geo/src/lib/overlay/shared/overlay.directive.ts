import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import GeoJSON from 'ol/format/GeoJSON';
import {
  createEmpty as createEmptyExtent,
  isEmpty as extentIsEmpty,
  extend as extendExtent,
  intersects as intersectsExtent
} from 'ol/extent.js';
import { transformExtent } from 'ol/proj.js';

import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { SourceFeatureType } from '../../feature/shared/feature.enum';
import { Feature } from '../../feature/shared/feature.interface';

import { OverlayService } from '../shared/overlay.service';
import { OverlayAction } from '../shared/overlay.interface';

@Directive({
  selector: '[igoOverlay]'
})
export class OverlayDirective implements OnInit, OnDestroy {
  private features$$: Subscription;
  private format = new GeoJSON();

  get map(): IgoMap {
    return this.component.map;
  }

  constructor(
    @Self() private component: MapBrowserComponent,
    private overlayService: OverlayService
  ) {}

  ngOnInit() {
    this.features$$ = this.overlayService.features$.subscribe(res =>
      this.handleFeatures(res[0], res[1])
    );
  }

  ngOnDestroy() {
    this.features$$.unsubscribe();
  }

  private handleFeatures(features: Feature[], action: OverlayAction) {
    this.map.clearOverlay();

    if (!features || features.length === 0) {
      return;
    }

    const extent = createEmptyExtent();

    let featureExtent, geometry;
    features.forEach((feature: Feature) => {
      const olFeature = this.format.readFeature(feature, {
        dataProjection: feature.projection,
        featureProjection: this.map.projection
      });

      geometry = olFeature.getGeometry();
      featureExtent = this.getFeatureExtent(feature);
      if (extentIsEmpty(featureExtent)) {
        if (geometry !== null) {
          featureExtent = geometry.getExtent();
        }
      }
      extendExtent(extent, featureExtent);

      this.map.addOverlay(olFeature);
    }, this);
    if (features[0].sourceType === SourceFeatureType.Click) {
      if (intersectsExtent(featureExtent, this.map.getExtent())) {
        action = 'none';
      } else {
        action = 'move';
      }
    }
    if (!extentIsEmpty(featureExtent)) {
      if (action === 'zoom') {
        this.map.zoomToExtent(extent);
      } else if (action === 'move') {
        this.map.moveToExtent(extent);
      }
    }
  }

  private getFeatureExtent(feature: Feature): [number, number, number, number] {
    let extent = createEmptyExtent();

    if (feature.extent && feature.projection) {
      extent = transformExtent(
        feature.extent,
        feature.projection,
        this.map.projection
      );
    }

    return extent;
  }
}
