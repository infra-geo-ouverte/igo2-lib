import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';

import * as olproj from 'ol/proj';

import { IgoMap } from '../shared/map';
import { MapExtent } from '../shared/map.interface';
import { HomeExtentButtonOptions } from './home-extent-button.interface';

/*
Button to center the map to the home extent
*/
@Component({
  selector: 'igo-home-extent-button',
  templateUrl: './home-extent-button.component.html',
  styleUrls: ['./home-extent-button.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule, MatIconModule, IgoLanguageModule]
})
export class HomeExtentButtonComponent {
  @Input() map: IgoMap;
  @Input() color: string;
  @Input() extentOverride?: MapExtent;
  @Input() centerOverride?: [number, number];
  @Input() zoomOverride?: number;

  private homeExtentButtonExtent;
  private homeExtentButtonCenter;
  private homeExtentButtonZoom;

  constructor(public configService: ConfigService) {
    this.computeHomeExtent();
  }

  computeHomeExtent() {
    const homeExtentButtonOptions: HomeExtentButtonOptions =
      this.configService.getConfig('homeExtentButton');

    this.homeExtentButtonExtent =
      this.extentOverride || homeExtentButtonOptions?.homeExtButtonExtent;
    this.homeExtentButtonCenter =
      this.centerOverride || homeExtentButtonOptions?.homeExtButtonCenter;
    this.homeExtentButtonZoom =
      this.zoomOverride || homeExtentButtonOptions?.homeExtButtonZoom;

    // priority over extent if these 2 properties are defined;
    if (this.centerOverride && this.zoomOverride) {
      this.homeExtentButtonExtent = undefined;
    }
  }

  onToggleClick() {
    this.computeHomeExtent();
    if (this.homeExtentButtonExtent) {
      this.map.viewController.zoomToExtent(this.homeExtentButtonExtent);
    } else if (this.homeExtentButtonCenter && this.homeExtentButtonZoom) {
      const center = olproj.fromLonLat(
        this.homeExtentButtonCenter,
        this.map.viewController.olView.getProjection().getCode()
      );
      this.map.viewController.olView.setCenter(center);
      this.map.viewController.zoomTo(this.homeExtentButtonZoom);
    }
  }
}
