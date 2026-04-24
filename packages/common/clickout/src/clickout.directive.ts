import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  output
} from '@angular/core';

@Directive({
  selector: '[igoClickout]'
})
export class ClickoutDirective {
  private el = inject(ElementRef);

  readonly clickout = output<MouseEvent>();

  @HostListener('document:click', ['$event'])
  handleMouseClick(event: MouseEvent) {
    const target = event.target;
    if (!target) {
      return;
    }

    if (!this.el.nativeElement.contains(target)) {
      this.clickout.emit(event);
    }
  }
}
