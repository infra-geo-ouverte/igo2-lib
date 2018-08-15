import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import olFormatGeoJSON from 'ol/format/GeoJSON';
import * as olextent from 'ol/extent';
import * as olproj from 'ol/proj';

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
  private format = new olFormatGeoJSON();

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

    const extent = olextent.createEmpty();

    let featureExtent, geometry;
    features.forEach((feature: Feature) => {
      const olFeature = this.format.readFeature(feature, {
        dataProjection: feature.projection,
        featureProjection: this.map.projection
      });

      geometry = olFeature.getGeometry();
      featureExtent = this.getFeatureExtent(feature);
      if (olextent.isEmpty(featureExtent)) {
        if (geometry !== null) {
          featureExtent = geometry.getExtent();
        }
      }
      olextent.extend(extent, featureExtent);

      this.map.addOverlay(olFeature);
    }, this);
    if (features[0].sourceType === SourceFeatureType.Click) {
      if (olextent.intersects(featureExtent, this.map.getExtent())) {
        action = 'none';
      } else {
        action = 'move';
      }
    }
    if (!olextent.isEmpty(featureExtent)) {
      if (action === 'zoom') {
        this.map.zoomToExtent(extent);
      } else if (action === 'move') {
        this.map.moveToExtent(extent);
      }
    }
  }

  private getFeatureExtent(feature: Feature): [number, number, number, number] {
    let extent = olextent.createEmpty();

    if (feature.extent && feature.projection) {
      extent = olproj.transformExtent(
        feature.extent,
        feature.projection,
        this.map.projection
      );
    }

    return extent;
  }
}
