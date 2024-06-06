import { AsyncPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';
import { userAgent } from '@igo2/utils';

import NoSleep from 'nosleep.js';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-wake-lock-button',
  templateUrl: './wake-lock-button.component.html',
  styleUrls: ['./wake-lock-button.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})

/**
 * Prevent display sleep and enable wake lock in all Android and iOS web browsers.
 * On iOS, the Wake Lock API is not supported
 * https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
 * On not supported browser, a fake video is used to keep the screen open.
 *
 * TODO: When the API will be supported by every browser, We should remove the NoSleep.js dependency
 * and replace it by a WakeLock API implementation.
 */
export class WakeLockButtonComponent {
  @Input() color = 'primary';
  @Input()
  get enabled(): boolean {
    return this.storageService.get('wakeLockEnabled') as boolean;
  }
  set enabled(value: boolean) {
    this.storageService.set('wakeLockEnabled', value);
  }

  private noSleep: NoSleep;
  readonly icon$ = new BehaviorSubject<string>('bedtime');
  public visible = false;

  constructor(private storageService: StorageService) {
    this.noSleep = new NoSleep();
    const nonWakeLockApiBrowser = userAgent.satisfies({
      ie: '>0',
      edge: '<84',
      chrome: '<84',
      firefox: '>0',
      opera: '<70',
      safari: '>0'
    });
    if (nonWakeLockApiBrowser) {
      this.disableWakeLock();
      this.enabled = false;
      window.addEventListener('blur', () => {
        this.disableWakeLock();
        this.enabled = false;
      });
    }
    this.enabled ? this.enableWakeLock() : this.disableWakeLock();
  }

  /**
   * Prevent display sleep and enable wake lock in all Android and iOS web browsers.
   * On iOS, the Wake Lock API is not supported
   * https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
   * On not supported browser, a fake video is used to keep the screen open.
   */
  private enableWakeLock() {
    this.noSleep.enable();
    this.enabled = true;
    this.icon$.next('bedtime_off');
  }
  /**
   * Let display sleep
   */
  private disableWakeLock() {
    this.noSleep.disable();
    this.enabled = false;
    this.icon$.next('bedtime');
  }

  toggleWakeLock() {
    if (this.enabled) {
      this.disableWakeLock();
    } else {
      this.enableWakeLock();
    }
  }
}
