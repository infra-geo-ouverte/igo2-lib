import { Component, Input } from '@angular/core';

import { IgoMap } from '../shared/map';

@Component({
  selector: 'igo-zoom-button',
  templateUrl: './zoom-button.component.html',
  styleUrls: ['./zoom-button.component.scss']
})
export class ZoomButtonComponent {

  @Input() map: IgoMap;

  @Input() color: string;

  get zoom(): number { return this.map.viewController.getZoom(); }

  constructor() {}
}
