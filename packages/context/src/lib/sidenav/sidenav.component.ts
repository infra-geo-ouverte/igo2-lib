import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';

import { getEntityTitle } from '@igo2/common/entity';
import { FlexibleComponent, FlexibleState } from '@igo2/common/flexible';
import { PanelComponent } from '@igo2/common/panel';
import { Tool } from '@igo2/common/tool';
import { IgoLanguageModule } from '@igo2/core/language';
import type { Media } from '@igo2/core/media';
import {
  Feature,
  FeatureDetailsComponent,
  FeatureMotion,
  moveToOlFeatures
} from '@igo2/geo';
import type { IgoMap } from '@igo2/geo';

import olFormatGeoJSON from 'ol/format/GeoJSON';

@Component({
  selector: 'igo-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  imports: [
    MatSidenavModule,
    FlexibleComponent,
    PanelComponent,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    FeatureDetailsComponent,
    IgoLanguageModule
  ]
})
export class SidenavComponent {
  titleService = inject(Title);

  private format = new olFormatGeoJSON();

  readonly map = input.required<IgoMap>();
  readonly opened = input<boolean>(false);
  readonly feature = input.required<Feature>();
  readonly tool = input<Tool>();
  readonly media = input<Media>();
  readonly title = input<string>('');

  public topPanelState: FlexibleState = 'initial';

  private readonly _defaultTitle = this.titleService.getTitle();
  readonly displayTitle = computed(() => this.title() || this._defaultTitle);

  get featureTitle(): string | undefined {
    const feature = this.feature();
    return feature ? getEntityTitle(feature) : undefined;
  }

  zoomToFeatureExtent() {
    const feature = this.feature();
    if (feature?.geometry) {
      const olFeature = this.format.readFeature(feature, {
        dataProjection: feature.projection,
        featureProjection: this.map().viewProjection
      });
      moveToOlFeatures(
        this.map().viewController,
        olFeature,
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
