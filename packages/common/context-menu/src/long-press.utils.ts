import { DestroyRef, ElementRef, Renderer2, inject } from '@angular/core';

export const LONG_PRESS_DEFAULT_DURATION = 400;

const CANCEL_EVENTS = ['touchmove', 'touchcancel', 'touchend'] as const;

export interface LongPressOptions {
  duration?: () => number;
}

/**
 * Emits a callback after a touch has been held.
 * Listeners are removed when the host directive is destroyed.
 */
export function listenToLongPress(
  callback: (event: TouchEvent) => void,
  options: LongPressOptions = {}
): void {
  const element = inject(ElementRef).nativeElement as HTMLElement;
  const renderer = inject(Renderer2);
  const duration = options.duration ?? (() => LONG_PRESS_DEFAULT_DURATION);
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const cancel = () => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };

  const unlisteners = [
    renderer.listen(element, 'touchstart', (event: TouchEvent) => {
      cancel();
      if (event.touches.length > 1) {
        return;
      }
      timeout = setTimeout(() => callback(event), duration());
    }),
    ...CANCEL_EVENTS.map((type) =>
      renderer.listen(element, type, () => cancel())
    )
  ];

  inject(DestroyRef).onDestroy(() => {
    cancel();
    unlisteners.forEach((unlisten) => unlisten());
  });
}
