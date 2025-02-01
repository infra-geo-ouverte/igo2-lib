import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  getEntityIcon,
  getEntityTitle,
  getEntityTitleHtml
} from '@igo2/common/entity';
import { StopPropagationDirective } from '@igo2/common/stop-propagation';

import olFormatGeoJSON from 'ol/format/GeoJSON';

import { FeatureMotion, moveToOlFeatures } from '../../feature';
import { IgoMap } from '../../map/shared/map';
import { SearchResult } from '../shared/search.interfaces';

/**
 * Search results list item
 */
@Component({
  selector: 'igo-search-results-item',
  templateUrl: './search-results-item.component.html',
  styleUrls: ['./search-results-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatListModule,
    NgIf,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    StopPropagationDirective
  ]
})
export class SearchResultsItemComponent {
  /**
   * Search result item
   */
  @Input() result: SearchResult;

  @Input() map: IgoMap;

  /**
   * Search result title
   * @internal
   */

  /**
   * to show hide results icons
   */
  @Input() showIcons: boolean;

  /**
   * Whether there should be a zoom button
   */
  @Input() withZoomButton = false;

  @Output() zoomEvent = new EventEmitter<boolean>();

  private format = new olFormatGeoJSON();

  get title(): string {
    return getEntityTitle(this.result);
  }

  /**
   * Search result HTML title
   * @internal
   */
  get titleHtml(): string {
    return getEntityTitleHtml(this.result);
  }

  /**
   * Search result tooltip
   * @internal
   */
  get tooltipHtml(): string {
    return this.titleHtml
      .replace(/<small?[^>]+(>|$)/g, '\n')
      .replace(/<\/?[^>]+(>|$)/g, '');
  }

  /**
   * Search result icon
   * @internal
   */
  get icon(): string {
    return getEntityIcon(this.result);
  }

  onZoomHandler() {
    const olFeature = this.format.readFeature(this.result.data, {
      dataProjection: this.result.data.projection,
      featureProjection: this.map.projection
    });
    this.map.geolocationController.temporaryDisableFollowPosition = true;
    moveToOlFeatures(
      this.map.viewController,
      [olFeature],
      FeatureMotion.Default
    );
  }

  /**
   * On mouse event, mouseenter /mouseleave
   * @internal
   */
  onMouseEvent(event) {
    const element = event.target;
    const type = event.type;
    switch (type) {
      case 'mouseenter': {
        const hideBtn = element.querySelector('#hide-save-search-result-btn');
        hideBtn?.setAttribute('id', 'show-save-search-result-btn');
        break;
      }
      case 'mouseleave': {
        const showBtn = element.querySelector('#show-save-search-result-btn');
        showBtn?.setAttribute('id', 'hide-save-search-result-btn');
        break;
      }
      default:
        break;
    }
  }
}
