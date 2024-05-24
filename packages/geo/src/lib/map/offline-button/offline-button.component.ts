import { NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { IgoMap } from '../shared/map';

@Component({
  selector: 'igo-offline-button',
  templateUrl: './offline-button.component.html',
  styleUrls: ['./offline-button.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    NgClass,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class OfflineButtonComponent implements OnInit {
  btnStyle: string = 'onlineStyle';

  @Input() map: IgoMap;
  @Input() color: string;
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
