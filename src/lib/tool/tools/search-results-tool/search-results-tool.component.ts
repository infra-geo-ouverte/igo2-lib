import { Component } from '@angular/core';

import { Feature } from '../../../feature';
import { OverlayService } from '../../../overlay';

import { Register } from '../../shared';


@Register({
  name: 'searchResults',
  title: 'igo.searchResults',
  icon: 'search'
})
@Component({
  selector: 'igo-search-results-tool',
  templateUrl: './search-results-tool.component.html',
  styleUrls: ['./search-results-tool.component.styl']
})
export class SearchResultsToolComponent {

  constructor(private overlayService: OverlayService) { }

  handleFeatureFocus(feature: Feature) {
    this.overlayService.setFeatures([feature], 'move');
  }

  handleFeatureSelect(feature: Feature) {
    this.overlayService.setFeatures([feature], 'zoom');
  }

}
