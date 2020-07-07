import { OnInit, OnDestroy, Directive, Self, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { FeatureDetailsComponent } from './feature-details.component';

import olGeolocation from 'ol/Geolocation';
import * as olProj from 'ol/proj';

import { BehaviorSubject } from 'rxjs';

import pointOnFeature from '@turf/point-on-feature';


@Directive({
  selector: '[igoFeatureDetailsDirective]'
})
export class FeatureDetailsDirective implements OnInit {
  private component: FeatureDetailsComponent;
  public geolocation$ = new BehaviorSubject<olGeolocation>(undefined);
  private geolocation: olGeolocation;

  get map() {
    return this.component.map;
  }

  get feature() {
    return this.component.feature;
  }

  @HostListener('routeEvent')
  activateRouting() {
    console.log('ici')
    this.component.toolbox.activateTool('directions');
  }

  constructor(
    @Self() component: FeatureDetailsComponent,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.geolocation = new olGeolocation({
      trackingOptions: {
        enableHighAccuracy: true
      },
      projection: this.map.projection,
      tracking: true
    });

    this.geolocation.on('change', evt => {
      this.geolocation$.next(this.geolocation);
    });

    this.geolocation$.subscribe(geolocation => {
      if (this.map.geolocation$.getValue().getTracking() === false) {
        geolocation.setTracking(false);
      }

      if (geolocation.getTracking() === true) {
        let userCoord = geolocation.getPosition();
        userCoord = olProj.transform(userCoord, this.map.projection, 'EPSG:4326');
      }

      let destCoord;
      if (this.feature.geometry.type === 'Point') {
        destCoord = this.feature.geometry.coordinates[0] + ',' + this.feature.geometry.coordinates[1];
      } else {
        const point = pointOnFeature(this.feature.geometry);
        destCoord = point[0] + ',' + point[1];
      }
      console.log(destCoord);
    })
  }

  ngAfterViewInit() {
    const routeElement = (<HTMLElement>this.el.nativeElement)
      .querySelector('routing');

    console.log(routeElement);

    this.renderer.listen(routeElement, 'click', () => {
      alert('Buton was clicked');
    });
  }
}
