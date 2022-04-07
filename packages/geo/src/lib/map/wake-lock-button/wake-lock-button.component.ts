import { Component, Input, AfterViewInit } from '@angular/core';
import { ConfigService, StorageService } from '@igo2/core';
import { BehaviorSubject } from 'rxjs';
import NoSleep from 'nosleep.js';
import { IgoMap } from '../shared/map';

@Component({
  selector: 'igo-wake-lock-button',
  templateUrl: './wake-lock-button.component.html',
  styleUrls: ['./wake-lock-button.component.scss']
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
export class WakeLockButtonComponent implements AfterViewInit {

  @Input() color: string = 'primary';
  @Input() map: IgoMap;
  @Input()
  get enabled(): boolean {
    return this.storageService.get('wakeLockEnabled') as boolean;
  }
  set enabled(value: boolean) {
    this.storageService.set('wakeLockEnabled', value);
  }

  private noSleep = new NoSleep();
  readonly icon$: BehaviorSubject<string> = new BehaviorSubject('sleep');
  public visible = false;

  constructor(
    private config: ConfigService,
    private storageService: StorageService
  ) {
   this.visible = this.config.getConfig('wakeLockApiButton') ? true : false;
  }
  ngAfterViewInit(): void {
    if (this.enabled) {
      this.map.ol.once('precompose', () => {
        this.enableWakeLock();
      });
    }
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
    this.icon$.next('sleep-off');
  }
  /**
   * Let display sleep
   */
  private disableWakeLock() {
    this.noSleep.disable();
    this.enabled = false;
    this.icon$.next('sleep');
  }

  toggleWakeLock() {
    if (this.enabled) {
      this.disableWakeLock();
    } else {
      this.enableWakeLock();
    }
  }
}
