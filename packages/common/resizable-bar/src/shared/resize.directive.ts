import { Directive, HostListener, output } from '@angular/core';

import { Subscription, fromEvent } from 'rxjs';

@Directive({
  selector: '[igoResize]'
})
export class ResizeDirective {
  private mouseMove$$?: Subscription;
  private mouseUp$$?: Subscription;

  readonly change = output<MouseEvent>();

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.mouseUp$$ = fromEvent(document, 'mouseup').subscribe(() => {
      this._unsubscribe();
    });

    this.mouseMove$$ = fromEvent<MouseEvent>(document, 'mousemove').subscribe(
      (moveEvent) => {
        this.change.emit(moveEvent);
      }
    );

    event.preventDefault();
  }

  private _unsubscribe(): void {
    this.mouseUp$$?.unsubscribe();
    this.mouseMove$$?.unsubscribe();
  }
}
