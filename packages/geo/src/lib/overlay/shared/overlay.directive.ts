import { Directive, OnDestroy, OnInit, Self } from '@angular/core';

import olFormatGeoJSON from 'ol/format/GeoJSON';

import { Subscription } from 'rxjs';

import { Feature } from '../../feature/shared/feature.interfaces';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { IgoMap } from '../../map/shared/map';
import { OverlayAction } from '../shared/overlay.enum';
import { OverlayService } from '../shared/overlay.service';

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
