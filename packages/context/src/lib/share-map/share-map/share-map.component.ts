import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { ConfigService } from '@igo2/core/config';
import type { IgoMap } from '@igo2/geo';

import { TranslateModule } from '@ngx-translate/core';

import { ShareMapApiComponent } from './share-map-api.component';
import { ShareMapUrlComponent } from './share-map-url.component';

@Component({
  selector: 'igo-share-map',
  templateUrl: './share-map.component.html',
  styleUrls: ['./share-map.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatTabsModule,
    ShareMapApiComponent,
    ShareMapUrlComponent,
    TranslateModule
  ]
})
export class ShareMapComponent {
  @Input() map: IgoMap;

  public hasApi = false;

  constructor(private config: ConfigService) {
    this.hasApi = this.config.getConfig('context.url') ? true : false;
  }
}
