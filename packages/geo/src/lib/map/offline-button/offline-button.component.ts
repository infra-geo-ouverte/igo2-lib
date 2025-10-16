import { NgClass } from '@angular/common';
import { Component, OnInit, input, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { IgoMap } from '../shared/map';

@Component({
  selector: 'igo-offline-button',
  templateUrl: './offline-button.component.html',
  styleUrls: ['./offline-button.component.scss'],
  imports: [
    MatButtonModule,
    MatTooltipModule,
    NgClass,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class OfflineButtonComponent implements OnInit {
  btnStyle = 'onlineStyle';

  readonly map = input<IgoMap>(undefined);
  readonly color = input<string>(undefined);
  enabled = model(false);

  ngOnInit(): void {
    this.map().forcedOffline$.next(this.enabled());
  }

  onClick() {
    this.enabled.set(!this.enabled());
    this.handleButtonStyle();
    this.map().forcedOffline$.next(this.enabled());
  }

  private handleButtonStyle() {
    if (this.enabled()) {
      this.btnStyle = 'offlineStyle';
    } else {
      this.btnStyle = 'onlineStyle';
    }
  }
}
