import { OnInit, Directive, Self, HostListener, ElementRef, Output, EventEmitter } from '@angular/core';
import { FeatureDetailsComponent } from './feature-details.component';

import olGeolocation from 'ol/Geolocation';
import * as olProj from 'ol/proj';

import { BehaviorSubject } from 'rxjs';

import pointOnFeature from '@turf/point-on-feature';
import { Feature, FEATURE } from '../shared';

@Directive({
  // This directive allow to view the route between the user coordinates and the feature
  selector: '[igoFeatureDetailsDirective]'
})

export class FeatureDetailsDirective implements OnInit {
  private component: FeatureDetailsComponent;
  public geolocation$ = new BehaviorSubject<olGeolocation>(undefined);

  public start: Feature = {
    meta: { id: 1 },
    type: FEATURE,
    geometry: {
      type: 'Point',
      coordinates: undefined
    },
    projection: 'EPSG:4326',
    properties: {
      id: 1,
      name: 'User coordinates',
    }
  };

  public end: Feature;

  get map() {
    return this.component.map;
  }

  get feature() {
    return this.component.feature;
  }
  feature$ = new BehaviorSubject(undefined);

  get geolocation() {
    return this.component.geolocation;
  }

  @Output() routingEvent = new EventEmitter<Feature[]>()

  @HostListener('selectFeature')
  setFeature() {
    this.feature$.next(this.feature);
  }

  constructor(
    @Self() component: FeatureDetailsComponent,
    private el: ElementRef
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.geolocation.on('change', evt => {
      this.geolocation$.next(this.geolocation);
    });

    this.geolocation$.subscribe(geolocation => {
      console.log(geolocation);
      if (!geolocation) {
        return;
      }
      geolocation.setProjection(this.map.projection);

      if (this.map.geolocation$.getValue() && this.map.geolocation$.getValue().getTracking() === false) {
        geolocation.setTracking(false);
      }
      console.log(geolocation.getTracking());
      if (geolocation.getTracking() === true) {
        let userCoord = geolocation.getPosition();
        console.log(userCoord);
        userCoord = olProj.transform(userCoord, this.map.projection, 'EPSG:4326');
        console.log(userCoord);
        this.start.geometry.coordinates = userCoord;
      }
    })

    this.feature$.subscribe(() => {
      if (this.feature.geometry.type === 'Point') {
        this.end = this.feature;
      } else {
        this.end = pointOnFeature(this.feature.geometry);
      }
      this.bindClicking();
    })
  }

  bindClicking() {
    const routeElement = (<HTMLElement>this.el.nativeElement).querySelector('span.routing');
    routeElement.addEventListener('click', this.activateRouting.bind(this));
  }

  activateRouting() {
    if (!this.geolocation) {
      const geolocation = new olGeolocation({
        trackingOptions: {
          enableHighAccuracy: true
        },
        projection: this.map.projection,
        tracking: true
      });

      geolocation.on('change', evt => {
        this.geolocation$.next(geolocation);
      });
    }
    console.log(this.start, this.end);
    this.start.geometry.coordinates ? this.routingEvent.emit([this.start, this.end]) : this.routingEvent.emit([this.end]);
  }
}
