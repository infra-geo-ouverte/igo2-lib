import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[igoCollapse]',
  standalone: true
})
export class CollapseDirective {
  @Input()
  get target() {
    return this._target;
  }
  set target(value: Element) {
    this._target = value;
  }
  private _target: Element;

  @Input()
  get collapsed(): boolean {
    return this._collapsed;
  }
  set collapsed(collapsed: boolean) {
    collapsed ? this.collapseTarget() : this.expandTarget();
    this._collapsed = collapsed;
    this.toggle.emit(collapsed);
  }
  private _collapsed = false;

  @Output() toggle = new EventEmitter<boolean>();

  @HostListener('click')
  click() {
    this.collapsed = !this.collapsed;
  }

  constructor(
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  private collapseTarget() {
    this.renderer.addClass(this.target, 'igo-collapsed');
    this.renderer.addClass(this.el.nativeElement, 'collapsed');
  }

  private expandTarget() {
    this.renderer.removeClass(this.target, 'igo-collapsed');
    this.renderer.removeClass(this.el.nativeElement, 'collapsed');
  }
}
