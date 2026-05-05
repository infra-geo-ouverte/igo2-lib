import { Component, input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import type { IgoMap } from '@igo2/geo';

import { ShareMapUrlComponent } from './share-map-url.component';

@Component({
  selector: 'igo-share-map',
  templateUrl: './share-map.component.html',
  styleUrls: ['./share-map.component.scss'],
  imports: [MatTabsModule, ShareMapUrlComponent]
})
export class ShareMapComponent {
  readonly map = input<IgoMap>(undefined);
}
