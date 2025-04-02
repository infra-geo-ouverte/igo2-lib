import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
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
    NgIf,
    MatTabsModule,
    ShareMapApiComponent,
    ShareMapUrlComponent,
    IgoLanguageModule
  ]
})
export class ShareMapComponent {
  @Input() map: IgoMap;

  public hasApi = false;

  constructor(private config: ConfigService) {
    this.hasApi = this.config.getConfig('context.url') ? true : false;
  }
}
