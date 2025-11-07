import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  inject
} from '@angular/core';

@Directive({
  selector: '[igoClickout]',
  standalone: true
})
export class ClickoutDirective {
  private el = inject(ElementRef);

  @Output() clickout = new EventEmitter<MouseEvent>();

  @HostListener('document:click', ['$event', '$event.target'])
  handleMouseClick(event: MouseEvent, target: HTMLElement) {
    if (!target) {
      return;
    }

    if (!this.el.nativeElement.contains(target)) {
      this.clickout.emit(event);
    }
  }
}
