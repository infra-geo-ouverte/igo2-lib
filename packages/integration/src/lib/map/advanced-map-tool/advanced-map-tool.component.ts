import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ToolComponent } from '@igo2/common/tool';
import { IgoLanguageModule } from '@igo2/core/language';

import { MapState } from '../map.state';
import { AdvancedCoordinatesComponent } from './advanced-coordinates/advanced-coordinates.component';
import { AdvancedSwipeComponent } from './advanced-swipe/advanced-swipe.component';

@ToolComponent({
  name: 'advancedMap',
  title: 'igo.integration.tools.advancedMap',
  icon: 'home_repair_service'
})
/**
 * Tool to handle the advanced map tools
 */
@Component({
  selector: 'igo-advanced-map-tool',
  templateUrl: './advanced-map-tool.component.html',
  styleUrls: ['./advanced-map-tool.component.scss'],
  imports: [
    AdvancedSwipeComponent,
    MatDividerModule,
    AdvancedCoordinatesComponent,
    MatSlideToggleModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class AdvancedMapToolComponent {
  get tracking$() {
    return this.mapState.map.geolocationController?.tracking$;
  }
  get followPosition$() {
    return this.mapState.map.geolocationController?.followPosition$;
  }

  constructor(public mapState: MapState) {}

  toggleTracking(value) {
    if (!this.mapState.map.geolocationController) {
      return;
    }
    this.mapState.map.geolocationController.tracking = value;
  }

  toggleFollow(value) {
    if (!this.mapState.map.geolocationController) {
      return;
    }
    this.mapState.map.geolocationController.followPosition = value;
  }
}
