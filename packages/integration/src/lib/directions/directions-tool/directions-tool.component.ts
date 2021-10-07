import { Component, OnInit } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { LanguageService, MessageService } from '@igo2/core';
import { IgoMap, RoutesFeatureStore, StopsFeatureStore, StopsStore } from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { DirectionState } from '../directions.state';

@ToolComponent({
  name: 'directions',
  title: 'igo.integration.tools.directions',
  icon: 'directions'
})
@Component({
  selector: 'igo-directions-tool',
  templateUrl: './directions-tool.component.html'
})
export class DirectionsToolComponent implements OnInit {
  /**
   * stops
   * @internal
   */
  get stopsStore(): StopsStore { return this.directionState.stopsStore; }

  get debounceTime(): number { return this.directionState.debounceTime; }

  /**
   * stops
   * @internal
   */
   get stopsFeatureStore(): StopsFeatureStore { return this.directionState.stopsFeatureStore; }

  /**
   * routes
   * @internal
   */
  get routesFeatureStore(): RoutesFeatureStore { return this.directionState.routesFeatureStore; }

  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }


  get routeFromFeatureDetail() {
    return this.directionState.routeFromFeatureDetail;
  }

  constructor(
    private directionState: DirectionState,
    private mapState: MapState,
    private languageService: LanguageService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const translate = this.languageService.translate;
    const title = translate.instant(
      'igo.integration.directions.warning.title'
    );
    const msg = translate.instant('igo.integration.directions.warning.message');
    this.messageService.info(msg, title, { timeOut: 20000 });
  }

  onActiveRouteDescriptionChange(directions) {
    this.directionState.activeRouteDescription = directions;
  }

}
