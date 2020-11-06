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
    return this.component.map.geolocation$.getValue();
  }
  set geolocation(value) {
    if (value) {
      this.geolocation = value;
      this.geolocation.on('change', evt => {
        this.geolocation$.next(this.geolocation);
      });
    }
  }

  @Output() routingEvent = new EventEmitter<Feature[]>();

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
    this.map.geolocation$.subscribe(geolocation => {
      if (!geolocation) {
        return;
      }
      geolocation.setProjection(this.map.projection);

      if (geolocation && geolocation.getTracking() === false) {
        geolocation.setTracking(false);
      }

      if (geolocation.getTracking() === true) {
        let userCoord = geolocation.getPosition();
        userCoord = olProj.transform(userCoord, this.map.projection, 'EPSG:4326');
        this.start.geometry.coordinates = userCoord;
      }
    });

    this.feature$.subscribe(() => {
      if (this.feature.geometry) {
        if (this.feature.geometry.type === 'Point') {
          this.end = this.feature;
        } else {
          this.end = pointOnFeature(this.feature.geometry);
        }
        this.geolocation$.next(this.geolocation);
        this.bindClicking();
      }
    });
  }

  bindClicking() {
    setTimeout(() => {
      const routeElement = this.el.nativeElement.querySelector('span.routing');
      if (routeElement) {
        routeElement.addEventListener('click', () => {
          this.activateRouting();
        });
      }
    }, 1);
  }

  activateRouting() {
    this.start.geometry.coordinates ? this.routingEvent.emit([this.start, this.end]) : this.routingEvent.emit([this.end]);
  }
}
