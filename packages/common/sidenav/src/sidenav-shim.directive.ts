import { Directive, HostListener, Renderer2, inject } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

/**
 * <igoSidenavShim> directive.
 *
 * This directive prevents a material sidenav with mode="side"
 * from focusing an element after it's closed
 */
@Directive({
  selector: '[igoSidenavShim]',
  standalone: true
})
export class SidenavShimDirective {
  private renderer = inject(Renderer2);

  private focusedElement: HTMLElement;
  private blurElement: HTMLElement;

  @HostListener('open', ['$event'])
  onOpen() {
    this.focusedElement = document.activeElement as HTMLElement;
  }

  @HostListener('close-start', ['$event'])
  onCloseStart() {
    const focusedElement = document.activeElement as HTMLElement;
    if (focusedElement !== this.focusedElement) {
      this.blurElement = this.focusedElement;
    } else {
      this.blurElement = undefined;
    }
  }

  @HostListener('close', ['$event'])
  onClose() {
    if (this.blurElement) {
      this.renderer.selectRootElement(this.blurElement).blur();
    }

    this.blurElement = undefined;
    this.focusedElement = undefined;
  }
}
