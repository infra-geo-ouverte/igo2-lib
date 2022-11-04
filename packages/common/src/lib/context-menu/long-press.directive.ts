import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[igoLongPress]'
})
export class LongPressDirective {
  private touchTimeout: any;
  @Output() longpress = new EventEmitter();

  constructor() { }


  @HostListener('touchstart', ['$event'])
  public touchstart(e: TouchEvent) {
    this.touchTimeout = setTimeout(() => {
      this.longpress.emit(e);
    }, 400);
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
