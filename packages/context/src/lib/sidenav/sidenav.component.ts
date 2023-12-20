import { Component, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { FlexibleState, Tool, getEntityTitle } from '@igo2/common';
import type { Media } from '@igo2/core';
import { Feature, FeatureMotion, moveToOlFeatures } from '@igo2/geo';
import type { IgoMap } from '@igo2/geo';

import olFormatGeoJSON from 'ol/format/GeoJSON';
import { TranslateModule } from '@ngx-translate/core';
import { IgoFeatureDetailsModule } from '../../../../geo/src/lib/feature/feature-details/feature-details.module';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { PanelComponent } from '../../../../common/src/lib/panel/panel.component';
import { FlexibleComponent } from '../../../../common/src/lib/flexible/flexible.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
    selector: 'igo-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
    standalone: true,
    imports: [MatSidenavModule, FlexibleComponent, PanelComponent, NgIf, MatButtonModule, MatTooltipModule, MatIconModule, IgoFeatureDetailsModule, TranslateModule]
})
export class SidenavComponent {
  private format = new olFormatGeoJSON();
  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;
  @Input()
  get opened(): boolean {
    return this._opened;
  }
  set opened(value: boolean) {
    this._opened = value;
  }
  private _opened: boolean;

  @Input()
  get feature(): Feature {
    return this._feature;
  }
  set feature(value: Feature) {
    this._feature = value;
  }
  private _feature: Feature;

  @Input()
  get tool(): Tool {
    return this._tool;
  }
  set tool(value: Tool) {
    this._tool = value;
  }
  private _tool: Tool;

  @Input()
  get media(): Media {
    return this._media;
  }
  set media(value: Media) {
    this._media = value;
  }
  private _media: Media;

  @Input()
  get title(): string {
    return this._title;
  }
  set title(value: string) {
    if (value) {
      this._title = value;
    }
  }
  private _title: string;

  public topPanelState: FlexibleState = 'initial';

  get featureTitle(): string {
    return this.feature ? getEntityTitle(this.feature) : undefined;
  }

  constructor(public titleService: Title) {
    this._title = this.titleService.getTitle();
  }

  zoomToFeatureExtent() {
    if (this.feature.geometry) {
      const olFeature = this.format.readFeature(this.feature, {
        dataProjection: this.feature.projection,
        featureProjection: this.map.viewProjection
      });
      moveToOlFeatures(
        this.map.viewController,
        [olFeature],
        FeatureMotion.Zoom
      );
    }
  }

  toggleTopPanel() {
    if (this.topPanelState === 'initial') {
      this.topPanelState = 'expanded';
    } else {
      this.topPanelState = 'initial';
    }
  }
}
