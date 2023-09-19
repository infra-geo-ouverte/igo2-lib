import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import olFormatGeoJSON from 'ol/format/GeoJSON';

import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { Feature } from '../../feature/shared/feature.interfaces';

import { OverlayService } from '../shared/overlay.service';
import { OverlayAction } from '../shared/overlay.enum';

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
    this.features$$ = this.overlayService.features$.subscribe((res) =>
      this.handleFeatures(res[0], res[1])
    );
  }

  ngOnDestroy() {
    this.features$$.unsubscribe();
  }

  private handleFeatures(features: Feature[], action: OverlayAction) {}
}
