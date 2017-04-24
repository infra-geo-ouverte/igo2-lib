import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MapBrowserComponent, IgoMap } from '../../map';
import { VectorLayer } from '../../layer';
import { Feature } from '../../feature';

import { OverlayService } from '../shared/overlay.service';
import { OverlayAction } from '../shared/overlay.interface';


@Directive({
  selector: '[igoOverlay]'
})
export class OverlayDirective implements OnInit, OnDestroy {

  private component: MapBrowserComponent;
  private overlaySource: ol.source.Vector;
  private overlayStyle: ol.style.Style;
  private overlayMarkerStyle: ol.style.Style;
  private features$$: Subscription;

  private format = new ol.format.GeoJSON();

  get map(): IgoMap {
    return this.component.map;
  }

  constructor(@Self() component: MapBrowserComponent,
              private overlayService: OverlayService) {
    this.component = component;
  }

  ngOnInit() {
    this.overlayStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [0, 161, 222, 1],
        width: 3
      }),
      fill: new ol.style.Fill({
        color: [0, 161, 222, 0.1]
      })
    });

    this.overlayMarkerStyle = new ol.style.Style({
      image: new ol.style.Icon({
        src: 'src/assets/icons/place_blue_36px.svg',
        imgSize: [36, 36], // for ie
        anchor: [0.5, 1]
      })
    });

    const overlayLayer = new VectorLayer({
      title: 'Overlay',
      type: 'vector',
      zIndex: 999
    });
    this.map.addLayer(overlayLayer, false);
    this.overlaySource = overlayLayer.olLayer.getSource();

    this.features$$ = this.overlayService.features$
      .subscribe(res => this.handleFeatures(res[0], res[1]));
  }

  ngOnDestroy() {
    this.features$$.unsubscribe();
  }

  private handleFeatures(features: Feature[], action: OverlayAction) {
    this.overlaySource.clear();

    if (!features || features.length === 0) {
      return;
    }

    const extent = ol.extent.createEmpty();

    let featureExtent;
    features.forEach((feature: Feature) => {
      const olFeature = this.format.readFeature(feature, {
        dataProjection: feature.projection,
        featureProjection: this.map.projection
      });

      featureExtent = this.getFeatureExtent(feature);
      if (ol.extent.isEmpty(featureExtent)) {
        featureExtent = olFeature.getGeometry().getExtent();
      }
      ol.extent.extend(extent, featureExtent);

      this.addMarker(olFeature);
    }, this);

    if (action === 'zoom') {
      this.map.zoomToExtent(extent);
    } else if (action === 'move') {
      this.map.moveToExtent(extent);
    }
  }

  private addMarker(feature: ol.Feature) {
    const geometry = feature.getGeometry();

    let marker;
    if (geometry.getType() === 'Point') {
      marker = feature;
    } else {
      const centroid = ol.extent.getCenter(geometry.getExtent());
      marker = new ol.Feature(new ol.geom.Point(centroid));

      feature.setStyle(this.overlayStyle);
      this.overlaySource.addFeature(feature);
    }

    marker.setStyle(this.overlayMarkerStyle);
    this.overlaySource.addFeature(marker);
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
