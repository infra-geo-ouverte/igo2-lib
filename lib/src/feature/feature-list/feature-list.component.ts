import { Component } from '@angular/core';

import { FeatureService } from '../shared';


@Component({
  selector: 'igo-feature-list',
  templateUrl: './feature-list.component.html',
  styleUrls: ['./feature-list.component.styl']
})
export class FeatureListComponent {

  constructor(public featureService: FeatureService) {}

}
