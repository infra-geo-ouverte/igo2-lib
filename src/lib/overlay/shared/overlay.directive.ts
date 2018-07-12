import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import * as ol from 'openlayers';

import { MapBrowserComponent, IgoMap } from '../../map';
import { Feature, SourceFeatureType } from '../../feature';

import { OverlayService } from '../shared/overlay.service';
import { OverlayAction } from '../shared/overlay.interface';


@Directive({
  selector: '[igoOverlay]'
})
export class OverlayDirective implements OnInit, OnDestroy {

  private features$$: Subscription;
  private format = new ol.format.GeoJSON();

  get map(): IgoMap {
    return this.component.map;
  }

  constructor(@Self() private component: MapBrowserComponent,
              private overlayService: OverlayService) {}

  ngOnInit() {
    this.features$$ = this.overlayService.features$
      .subscribe(res => this.handleFeatures(res[0], res[1]));
  }

  ngOnDestroy() {
    this.features$$.unsubscribe();
  }

  private handleFeatures(features: Feature[], action: OverlayAction) {
    this.map.clearOverlay();

    if (!features || features.length === 0) {
      return;
    }

    const extent = ol.extent.createEmpty();

    let featureExtent, geometry;
    features.forEach((feature: Feature) => {
      const olFeature = this.format.readFeature(feature, {
        dataProjection: feature.projection,
        featureProjection: this.map.projection
      });

      geometry = olFeature.getGeometry();
      featureExtent = this.getFeatureExtent(feature);
      if (ol.extent.isEmpty(featureExtent)) {
        if (geometry !== null) {
          featureExtent = geometry.getExtent();
        }
      }
      ol.extent.extend(extent, featureExtent);

      this.map.addOverlay(olFeature);
    }, this);
    if (features[0].sourceType === SourceFeatureType.Click) {
      if (ol.extent.intersects(featureExtent, this.map.getExtent())) {
        action = 'none';
      } else {
        action = 'move';
      }
    }
    if (!ol.extent.isEmpty(featureExtent)) {
      if (action === 'zoom') {
        this.map.zoomToExtent(extent);
      } else if (action === 'move') {
        this.map.moveToExtent(extent);
      }
    }
  }

  private getFeatureExtent(feature: Feature): ol.Extent {
    let extent = ol.extent.createEmpty();

    if (feature.extent && feature.projection) {
      extent = ol.proj.transformExtent(
        feature.extent, feature.projection, this.map.projection);
    }

    return extent;
  }
}
