import { Component, Input } from '@angular/core';

import { IgoMap } from '../shared/map';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'igo-zoom-button',
    templateUrl: './zoom-button.component.html',
    styleUrls: ['./zoom-button.component.scss'],
    standalone: true,
    imports: [MatButtonModule, MatTooltipModule, MatIconModule, TranslateModule]
})
export class ZoomButtonComponent {
  @Input() map: IgoMap;

  @Input() color: string;

  get zoom(): number {
    return this.map.viewController.getZoom();
  }

  get minZoom(): number {
    return this.map.viewController.olView.getMinZoom() || 1;
  }

  get maxZoom(): number {
    return this.map.viewController.olView.getMaxZoom();
  }

  constructor() {}
}
