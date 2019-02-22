import {
  Directive,
  Self,
  OnInit,
  AfterViewInit,
  Optional
} from '@angular/core';

import { RouteService } from '@igo2/core';

import { MapService } from '../../map/shared/map.service';
import { RoutingFormComponent } from './routing-form.component';
import { RoutingFormService } from './routing-form.service';

@Directive({
  selector: '[igoRoutingFormBinding]'
})
export class RoutingFormBindingDirective implements OnInit, AfterViewInit {
  private component: RoutingFormComponent;

  constructor(
    @Self() component: RoutingFormComponent,
    private mapService: MapService,
    private routingFormService: RoutingFormService,
    @Optional() private route: RouteService
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.component.map = this.mapService.getMap();
  }

  ngAfterViewInit(): void {
    const storedStopsCoordinates = this.routingFormService.getStopsCoordinates();
    if (
      !storedStopsCoordinates &&
      this.route &&
      this.route.options.routingCoordKey
    ) {
      this.route.queryParams.subscribe(params => {
        const routingParams =
          params[this.route.options.routingCoordKey as string];
        const stopsCoordinatesFromURL = [];
        if (routingParams) {
          const routingCoordUrl = routingParams.split(';');
          if (routingCoordUrl.length >= 2) {
            let cnt = 0;
            routingCoordUrl.forEach(coord => {
              if (cnt !== 0 && cnt !== routingCoordUrl.length - 1) {
                this.component.stops.insert(cnt, this.component.createStop());
              }

              const stopCoordinatesFromURL = JSON.parse('[' + coord + ']');
              this.component.stops
                .at(cnt)
                .patchValue({ stopCoordinates: stopCoordinatesFromURL });
              this.component.stops
                .at(cnt)
                .patchValue({ stopPoint: stopCoordinatesFromURL });
              this.component.handleLocationProposals(
                stopCoordinatesFromURL,
                cnt
              );

              stopsCoordinatesFromURL.push(stopCoordinatesFromURL);
              this.component.addStopOverlay(stopCoordinatesFromURL, cnt);
              cnt++;
            });
            this.component.getRoutes(stopsCoordinatesFromURL, true);
          }
        }
      });
    } else if (storedStopsCoordinates) {
      for (let i = 0; i < storedStopsCoordinates.length; i++) {
        if (i !== 0 && i !== storedStopsCoordinates.length - 1) {
          this.component.stops.insert(i, this.component.createStop());
        }
        if (storedStopsCoordinates[i] instanceof Array) {
          this.component.addStopOverlay(storedStopsCoordinates[i], i);
          this.component.stops
            .at(i)
            .patchValue({ stopCoordinates: storedStopsCoordinates[i] });
          this.component.stops
            .at(i)
            .patchValue({ stopPoint: storedStopsCoordinates[i] });
          this.component.handleLocationProposals(storedStopsCoordinates[i], i);
        }
      }
    }
  }
}
