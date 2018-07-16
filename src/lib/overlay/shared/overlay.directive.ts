import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import GeoJSON from 'ol/format/geojson';
import extent from 'ol/extent';
import proj from 'ol/proj';

import { MapBrowserComponent, IgoMap } from '../../map';
import { Feature, SourceFeatureType } from '../../feature';

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

    const extentlocal = extent.createEmpty();

    let featureExtent, geometry;
    features.forEach((feature: Feature) => {
      const olFeature = this.format.readFeature(feature, {
        dataProjection: feature.projection,
        featureProjection: this.map.projection
      });

      geometry = olFeature.getGeometry();
      featureExtent = this.getFeatureExtent(feature);
      if (extent.isEmpty(featureExtent)) {
        if (geometry !== null) {
          featureExtent = geometry.getExtent();
        }
      }
      extent.extend(extentlocal, featureExtent);

      this.map.addOverlay(olFeature);
    }, this);
    if (features[0].sourceType === SourceFeatureType.Click) {
      if (extent.intersects(featureExtent, this.map.getExtent())) {
        action = 'none';
      } else {
        action = 'move';
      }
    }
    if (!extent.isEmpty(featureExtent)) {
      if (action === 'zoom') {
        this.map.zoomToExtent(extentlocal);
      } else if (action === 'move') {
        this.map.moveToExtent(extentlocal);
      }
    }
  }

  private getFeatureExtent(feature: Feature): ol.Extent {
    let extentlocal = extent.createEmpty();

    if (feature.extent && feature.projection) {
      extentlocal = proj.transformExtent(
        feature.extent, feature.projection, this.map.projection);
    }

    return extentlocal;
  }
}
