import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewContainerRef
} from '@angular/core';
import type { TemplateRef } from '@angular/core';

import { TemplatePortal } from '@angular/cdk/portal';
import { fromEvent, Observable, of, Subscription } from 'rxjs';
import { delay, filter, mergeMap, take, takeUntil, tap } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';

@Directive({
  selector: '[igoContextMenu]'
})
export class ContextMenuDirective implements OnDestroy {
  private overlayRef: OverlayRef | null;
  private sub: Subscription;
  private longTouch$$: Subscription;
  private touchmove$$: Subscription;
  private touchend$$: Subscription;
  private isDragging: boolean = false;

  @Input('igoContextMenu') menuContext: TemplateRef<any>;
  @Input() touchDelayMs: number = 500;
  @Output() menuPosition = new EventEmitter<{ x: number; y: number }>();

  constructor(
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    private elementRef: ElementRef
  ) {

    const touchstart$: Observable<TouchEvent> = fromEvent(elementRef.nativeElement, 'touchstart');
    const touchmove$: Observable<TouchEvent> = fromEvent(elementRef.nativeElement, 'touchmove');
    const touchend$: Observable<TouchEvent> = fromEvent(elementRef.nativeElement, 'touchend');

    touchmove$.subscribe(() => {
      this.isDragging = true;
      this.close();
    });
    touchend$.subscribe(() => this.isDragging = false);

    const longTouch$ = touchstart$.pipe(
      tap((event) => {
        event.preventDefault();
        window.document.body.style['-webkit-user-select'] = 'none';
      }),
      mergeMap((e) => {
        return of(e).pipe(
          delay(this.touchDelayMs),
          takeUntil(touchend$),
        );
      }),
    );
    this.longTouch$$ = longTouch$.pipe(
      tap((event) => {
        this.onContextMenu(event);
      }), delay(2000)
    ).subscribe(() => window.document.body.style['-webkit-user-select'] = 'auto');
  }
  ngOnDestroy(): void {
    if (this.longTouch$$) {
      this.longTouch$$.unsubscribe();
    }
    if (this.touchmove$$) {
      this.touchmove$$.unsubscribe();
    }
    if (this.touchend$$) {
      this.touchend$$.unsubscribe();
    }
  }

  @HostListener('contextmenu', ['$event'])
  public onContextMenu(e: MouseEvent | TouchEvent): void {
    if (this.isDragging) {
      return;
    }

    let x = 0;
    let y = 0;
    if (e instanceof TouchEvent) {
      if (e.touches.length > 1) {
        return; // prevent map rotation conflict
      }
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.x;
      y = e.y;
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
      new TemplatePortal(this.menuContext, this.viewContainerRef, {
        $implicit: undefined
      })
    );

    this.sub = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => {
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
        filter(event => {
          const clickTarget = event.target as HTMLElement;
          if (
            clickTarget &&
            !this.elementRef.nativeElement.contains(clickTarget) &&
            !this.overlayRef.overlayElement.contains(clickTarget)
          ) {
            return true;
          } else {
            event.preventDefault();
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
