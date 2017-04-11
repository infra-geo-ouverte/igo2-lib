import { Component } from '@angular/core';

import { FeatureService } from '../shared';

@Component({
  selector: 'igo-feature-details',
  templateUrl: './feature-details.component.html',
  styleUrls: ['./feature-details.component.styl']
})
export class FeatureDetailsComponent {

  constructor(public featureService: FeatureService) { }

}
