import { Directive, input, output } from '@angular/core';

import {
  LONG_PRESS_DEFAULT_DURATION,
  listenToLongPress
} from './long-press.utils';

/**
 * IgoLongPress trigger longpress event after a define duration.
 * This directive exist to patch the unavailable contextmenu event on iOS.
 * @param touchDuration touch duration in ms, default value is 400ms
 */
@Directive({
  selector: '[igoLongPress]'
})
export class LongPressDirective {
  readonly touchDuration = input(LONG_PRESS_DEFAULT_DURATION);
  readonly longpress = output<TouchEvent>();

  constructor() {
    listenToLongPress((event) => this.longpress.emit(event), {
      duration: () => this.touchDuration()
    });
  }
}
