import { Directive, HostListener, input, output } from '@angular/core';

/**
 * IgoLongPress trigger longpress event after a define duration.
 * This directive exist to patch the unavailable contextmenu event on iOS.
 * @param touchDuration touch duration in ms, default value is 400ms
 * @param iOSOnly define if longpress is triggered only for iOS, default value = true
 */
@Directive({
  selector: '[igoLongPress]',
  standalone: true
})
export class LongPressDirective {
  private touchTimeout: any;
  readonly touchDuration = input(400);
  readonly onlyIOS = input(true);
  readonly longpress = output<TouchEvent>();

  @HostListener('touchstart', ['$event'])
  public touchstart(e: TouchEvent) {
    if (e.touches.length > 1) {
      this.touchEnd();
      return;
    }
    this.touchTimeout = setTimeout(() => {
      this.longpress.emit(e);
    }, this.touchDuration());
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
