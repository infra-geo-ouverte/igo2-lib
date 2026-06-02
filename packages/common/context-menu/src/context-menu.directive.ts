import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  ElementRef,
  ViewContainerRef,
  inject,
  input,
  output
} from '@angular/core';
import type { TemplateRef } from '@angular/core';

import { Subscription, fromEvent } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Directive({
  selector: '[igoContextMenu]',
  host: {
    '(longpress)': 'onContextMenu($any($event))',
    '(contextmenu)': 'onContextMenu($event)'
  }
})
export class ContextMenuDirective {
  overlay = inject(Overlay);
  viewContainerRef = inject(ViewContainerRef);
  private elementRef = inject(ElementRef);

  private overlayRef: OverlayRef | null = null;
  private sub?: Subscription;

  readonly menuContext = input.required<TemplateRef<any>>({
    alias: 'igoContextMenu'
  });
  readonly menuPosition = output<{
    x: number;
    y: number;
  }>();

  onContextMenu(e: MouseEvent | TouchEvent): void {
    let x;
    let y;
    if (e instanceof MouseEvent) {
      x = e.x;
      y = e.y;
    } else if (e instanceof TouchEvent) {
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
    }
    if (!x || !y) {
      return;
    }

    this.close();
    e.preventDefault();
    this.menuPosition.emit({ x, y });
    this.overlayRef = null;
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo({ x, y })
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }
      ]);
    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });
    this.overlayRef.attach(
      new TemplatePortal(this.menuContext(), this.viewContainerRef, {
        $implicit: undefined
      })
    );

    this.sub = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter((event) => {
          const clickTarget = event.target as HTMLElement;
          this.close();
          return (
            !!this.overlayRef &&
            !this.overlayRef.overlayElement.contains(clickTarget)
          );
        }),
        take(1)
      )
      .subscribe(() => this.close());

    this.sub = fromEvent<MouseEvent>(document, 'contextmenu')
      .pipe(
        filter((event) => {
          const clickTarget = event.target as HTMLElement;
          if (
            clickTarget &&
            !this.elementRef.nativeElement.contains(clickTarget) &&
            this.overlayRef &&
            !this.overlayRef.overlayElement.contains(clickTarget)
          ) {
            return true;
          } else {
            event.preventDefault();
            return false;
          }
        }),
        take(1)
      )
      .subscribe(() => this.close());
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
