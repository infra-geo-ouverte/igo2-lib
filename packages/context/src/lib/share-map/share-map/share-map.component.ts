import { Component, inject, input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';
import type { IgoMap } from '@igo2/geo';

import { ShareMapApiComponent } from './share-map-api.component';
import { ShareMapUrlComponent } from './share-map-url.component';

@Component({
  selector: 'igo-share-map',
  templateUrl: './share-map.component.html',
  styleUrls: ['./share-map.component.scss'],
  imports: [
    MatTabsModule,
    ShareMapApiComponent,
    ShareMapUrlComponent,
    IgoLanguageModule
  ]
})
export class ShareMapComponent {
  private config = inject(ConfigService);

  readonly map = input<IgoMap>(undefined);

  public hasApi = false;

  constructor() {
    this.hasApi = this.config.getConfig('context.url') ? true : false;
  }
}
