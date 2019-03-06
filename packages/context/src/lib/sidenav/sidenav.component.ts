import { Component, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Media } from '@igo2/core';
import { FlexibleState, Tool, getEntityTitle } from '@igo2/common';
import { Feature, FeatureMotion, IgoMap, moveToFeatures } from '@igo2/geo';

import olFormatGeoJSON from 'ol/format/GeoJSON';

@Component({
  selector: 'igo-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
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
  private _title: string = this.titleService.getTitle();

  public topPanelState: FlexibleState = 'initial';

  get featureTitle(): string {
    return this.feature ? getEntityTitle(this.feature) : undefined;
  }

  constructor(public titleService: Title) {}

  zoomToFeatureExtent() {
    if (this.feature.geometry) {
      const olFeature = this.format.readFeature(this.feature, {
        dataProjection: this.feature.projection,
        featureProjection: this.map.projection
      });
      moveToFeatures(this.map, [olFeature], FeatureMotion.Zoom);
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
