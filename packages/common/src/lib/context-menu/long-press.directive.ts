import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';

import { userAgent } from '@igo2/utils';

/**
 * IgoLongPress trigger longpress event after a define duration.
 * This directive exist to patch the unavailable contextmenu event on iOS.
 * @param touchDuration touch duration in ms, default value is 400ms
 * @param iOSOnly define if longpress is triggered only for iOS, default value = true
 */
@Directive({
  selector: '[igoLongPress]'
})
export class LongPressDirective {
  private touchTimeout: any;
  @Input() touchDuration: number = 400;
  @Input() onlyIOS: boolean = true;
  @Output() longpress = new EventEmitter();

  constructor() {}

  @HostListener('touchstart', ['$event'])
  public touchstart(e: TouchEvent) {
    if (e.touches.length > 1) {
      this.touchEnd();
      return;
    }
    this.touchTimeout = setTimeout(() => {
      if (this.onlyIOS) {
        if (userAgent.getOSName() === 'iOS') {
          this.longpress.emit(e);
        }
      } else {
        this.longpress.emit(e);
      }
    }, this.touchDuration);
  }
  @HostListener('touchmove')
  @HostListener('touchcancel')
  @HostListener('touchend')
  public touchend() {
    this.touchEnd();
  }

  private touchEnd() {
    clearTimeout(this.touchTimeout);
  }
}
