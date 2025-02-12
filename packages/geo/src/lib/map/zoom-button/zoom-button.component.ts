import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { IgoMap } from '../shared/map';

@Component({
    selector: 'igo-zoom-button',
    templateUrl: './zoom-button.component.html',
    styleUrls: ['./zoom-button.component.scss'],
    imports: [MatButtonModule, MatTooltipModule, MatIconModule, IgoLanguageModule]
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
}
