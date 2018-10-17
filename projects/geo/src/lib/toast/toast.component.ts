import { Component, Input, Output, EventEmitter } from '@angular/core';

import { FlexibleState } from '@igo2/common';
import olFormatGeoJSON from 'ol/format/GeoJSON';
import { Feature } from '../feature/shared/feature.interface';
import { IgoMap } from '../map/shared/map';

@Component({
  selector: 'igo-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  static SWIPE_ACTION = {
    UP: 'swipeup',
    DOWN: 'swipedown'
  };
  private format = new olFormatGeoJSON();

  @Input()
  get expanded(): boolean {
    return this._expanded;
  }
  set expanded(value: boolean) {
    this.state = value ? 'expanded' : 'collapsed';
    this._expanded = value;
  }
  private _expanded: boolean;

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get feature(): Feature {
    return this._feature;
  }
  set feature(value: Feature) {
    this._feature = value;
  }
  private _feature: Feature;

  @Output() opened = new EventEmitter<boolean>();

  public state: FlexibleState;

  constructor() {}

  toggle() {
    this.expanded = !this.expanded;
    this.opened.emit(this.expanded);
  }

  zoomToFeatureExtent() {
    if (this.feature.geometry) {
      const olFeature = this.format.readFeature(this.feature, {
        dataProjection: this.feature.projection,
        featureProjection: this.map.projection
      });
      this.map.zoomToFeature(olFeature);
    }
  }

  swipe(action: string) {
    if (action === ToastComponent.SWIPE_ACTION.UP) {
      if (!this.expanded) {
        this.toggle();
      }
    } else if (action === ToastComponent.SWIPE_ACTION.DOWN) {
      if (this.expanded) {
        this.toggle();
      }
    }
  }
}
