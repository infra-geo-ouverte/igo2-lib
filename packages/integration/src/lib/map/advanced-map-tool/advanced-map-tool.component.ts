import { Component } from '@angular/core';
import { ToolComponent } from '@igo2/common';
import { MapState } from '../map.state';

@ToolComponent({
  name: 'advancedMap',
  title: 'igo.integration.tools.advancedMap',
  icon: 'toolbox'
})

/**
 * Tool to handle the advanced map tools
 */
@Component({
  selector: 'igo-advanced-map-tool',
  templateUrl: './advanced-map-tool.component.html',
  styleUrls: ['./advanced-map-tool.component.scss']
})

export class AdvancedMapToolComponent {

  get tracking$() {
    return this.mapState.map.geolocationController.tracking$;
  }
  get followPosition$() {
    return this.mapState.map.geolocationController.followPosition$;
  }

  constructor(
    public mapState: MapState) {}

  toggleTracking(value) {
    this.mapState.map.geolocationController.tracking = value;
  }

  toggleFollow(value) {
    this.mapState.map.geolocationController.followPosition = value;
  }
}
