import { Component, Input, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import olFormatGeoJSON from 'ol/format/GeoJSON';

import {
  getEntityTitle,
  getEntityTitleHtml,
  getEntityIcon
} from '@igo2/common';

import { SearchResult } from '../shared/search.interfaces';
import { FeatureMotion, moveToOlFeatures } from '../../feature';
import { IgoMap } from '../../map';

/**
 * Search results list item
 */
@Component({
  selector: 'igo-search-results-item',
  templateUrl: './search-results-item.component.html',
  styleUrls: ['./search-results-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  constructor() {}

  onZoomHandler() {
    const olFeature = this.format.readFeature(this.result.data, {
      dataProjection: this.result.data.projection,
      featureProjection: this.map.projection
    });
    moveToOlFeatures(this.map, [olFeature], FeatureMotion.Default);
  }
}
