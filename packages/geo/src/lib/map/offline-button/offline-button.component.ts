import { Component, Input, OnInit } from '@angular/core';

import { IgoMap } from '../shared/map';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'igo-offline-button',
    templateUrl: './offline-button.component.html',
    styleUrls: ['./offline-button.component.scss'],
    standalone: true,
    imports: [MatButtonModule, MatTooltipModule, NgClass, MatIconModule, TranslateModule]
})
export class OfflineButtonComponent implements OnInit {
  btnStyle: string = 'onlineStyle';

  @Input() map: IgoMap;
  @Input() color: IgoMap;
  @Input() enabled: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.map.forcedOffline$.next(this.enabled);
  }

  onClick() {
    this.enabled = !this.enabled;
    this.handleButtonStyle();
    this.map.forcedOffline$.next(this.enabled);
  }

  private handleButtonStyle() {
    if (this.enabled) {
      this.btnStyle = 'offlineStyle';
    } else {
      this.btnStyle = 'onlineStyle';
    }
  }
}
