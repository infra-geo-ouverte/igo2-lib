import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  FlexibleComponent,
  FlexibleState,
  PanelComponent,
  getEntityTitle
} from '@igo2/common';

import olFormatGeoJSON from 'ol/format/GeoJSON';

import { FeatureDetailsComponent } from '../feature/feature-details/feature-details.component';
import { FeatureMotion } from '../feature/shared/feature.enums';
import { Feature } from '../feature/shared/feature.interfaces';
import { moveToOlFeatures } from '../feature/shared/feature.utils';
import { IgoMap } from '../map/shared/map';

@Component({
  selector: 'igo-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  standalone: true,
  imports: [
    FlexibleComponent,
    PanelComponent,
    MatButtonModule,
    MatIconModule,
    NgIf,
    FeatureDetailsComponent
  ]
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

  /**
   * @internal
   */
  get title(): string {
    return getEntityTitle(this.feature);
  }

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
      moveToOlFeatures(
        this.map.viewController,
        [olFeature],
        FeatureMotion.Zoom
      );
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
