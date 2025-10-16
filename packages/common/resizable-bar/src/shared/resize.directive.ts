import { Directive, HostListener, output } from '@angular/core';

import { Subscription, fromEvent } from 'rxjs';

@Directive({
  selector: '[igoResize]'
})
export class ResizeDirective {
  mouseMove$$: Subscription;
  mouseUp$$: Subscription;

  readonly change = output<MouseEvent>();

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.mouseUp$$ = fromEvent(document, 'mouseup').subscribe(() => {
      this._unsubscribe();
    });

    this.mouseMove$$ = fromEvent(document, 'mousemove').subscribe(
      (moveEvent: MouseEvent) => {
        this.change.emit(moveEvent);
      }
    );

    event.preventDefault();
  }

  private _unsubscribe(): void {
    this.mouseUp$$.unsubscribe();
    this.mouseUp$$ = null;

    this.mouseMove$$.unsubscribe();
    this.mouseMove$$ = null;
  }
}
