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

import { LongPressDirective } from './long-press.directive';

/**
 * Position and source event of a context menu opening
 */
export interface ContextMenuPosition {
  x: number;
  y: number;
  /** The DOM event that triggered the menu (contextmenu or long press) */
  event: MouseEvent | TouchEvent;
}

@Directive({
  selector: '[igoContextMenu]',
  hostDirectives: [LongPressDirective],
  host: {
    '(contextmenu)': 'onContextMenu($event)'
  }
})
export class ContextMenuDirective {
  overlay = inject(Overlay);
  viewContainerRef = inject(ViewContainerRef);
  private elementRef = inject(ElementRef);
  private longPress = inject(LongPressDirective, { self: true });

  private overlayRef: OverlayRef | null = null;
  private sub?: Subscription;

  readonly menuContext = input<TemplateRef<any> | undefined>(undefined, {
    alias: 'igoContextMenu'
  });
  readonly menuPosition = output<ContextMenuPosition>();

  /**
   * Menu template registered programmatically, used when no
   * `igoContextMenu` template is bound (e.g. by a composing
   * directive providing a default menu)
   */
  private fallbackMenuContext?: TemplateRef<any>;

  constructor() {
    // Open the menu on touch long press (iOS fires no contextmenu event)
    this.longPress.longpress.subscribe((event: TouchEvent) =>
      this.onContextMenu(event)
    );
  }

  /**
   * Register the menu template to use when none is bound via
   * the `igoContextMenu` input
   */
  setMenuContext(template: TemplateRef<any>): void {
    this.fallbackMenuContext = template;
  }

  onContextMenu(e: MouseEvent | TouchEvent): void {
    const menuContext = this.menuContext() ?? this.fallbackMenuContext;
    if (!menuContext) {
      return;
    }
    let x;
    let y;
    if (e instanceof MouseEvent) {
      x = e.x;
      y = e.y;
    } else if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
    }
    if (!x || !y) {
      return;
    }

    this.close();
    e.preventDefault();
    this.menuPosition.emit({ x, y, event: e });
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
      new TemplatePortal(menuContext, this.viewContainerRef, {
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
