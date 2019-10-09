import {
  Directive,
  Self,
  AfterViewInit,
  Optional
} from '@angular/core';

import { RouteService } from '@igo2/core';

import { RoutingFormComponent } from './routing-form.component';
import { RoutingFormService } from './routing-form.service';

@Directive({
  selector: '[igoRoutingFormBinding]'
})
export class RoutingFormBindingDirective implements AfterViewInit {

  constructor(
    @Self() private component: RoutingFormComponent,
    private routingFormService: RoutingFormService,
    @Optional() private route: RouteService
  ) {}

  ngAfterViewInit(): void {
    const storedStops = this.routingFormService.getStops();
    if (
      !storedStops && this.route &&
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
    } else if (storedStops) {
      for (let i = 0; i < storedStops.length; i++) {
        if (i !== 0 && i !== storedStops.length - 1) {
          this.component.stops.insert(i, this.component.createStop());
        }
        if (storedStops[i].stopCoordinates instanceof Array) {
          this.component.addStopOverlay(storedStops[i].stopCoordinates, i);
          this.component.stops.at(i).patchValue(storedStops[i] );
        }
      }
    }
    this.component.onFormChange();
  }
}
