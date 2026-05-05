import { Component, computed, input, model, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { getEntityTitle } from '@igo2/common/entity';
import { FlexibleComponent, FlexibleState } from '@igo2/common/flexible';
import { PanelComponent } from '@igo2/common/panel';

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
  imports: [
    FlexibleComponent,
    PanelComponent,
    MatButtonModule,
    MatIconModule,
    FeatureDetailsComponent
  ]
})
export class ToastComponent {
  static SWIPE_ACTION = {
    UP: 'swipeup',
    DOWN: 'swipedown'
  };
  private format = new olFormatGeoJSON();

  readonly expanded = model<boolean>();
  readonly map = input<IgoMap>();
  readonly feature = input<Feature>();
  readonly opened = output<boolean>();

  public state = computed<FlexibleState>(() =>
    this.expanded ? 'expanded' : 'collapsed'
  );

  /**
   * @internal
   */
  get title(): string {
    return getEntityTitle(this.feature);
  }

  toggle() {
    this.expanded.update((previous) => !previous);
    this.opened.emit(this.expanded());
  }

  zoomToFeatureExtent() {
    const feature = this.feature();
    const map = this.map();
    if (feature?.geometry) {
      const olFeature = this.format.readFeature(this.feature, {
        dataProjection: feature?.projection,
        featureProjection: map?.projection
      });
      moveToOlFeatures(map?.viewController, olFeature, FeatureMotion.Zoom);
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
