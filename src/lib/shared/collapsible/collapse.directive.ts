import { Directive, Input, Output, EventEmitter,
         HostListener, ElementRef, Renderer } from '@angular/core';


@Directive({
  selector: '[igoCollapse]'
})
export class CollapseDirective {

  @Input()
  get target() { return this._target; }
  set target(value: Element) {
    this._target = value;
  }
  private _target: Element;

  @Input()
  get collapsed(): boolean { return this._collapsed; }
  set collapsed(collapsed: boolean) {
    collapsed ? this.collapseTarget() : this.expandTarget();
    this._collapsed = collapsed;
    this.toggle.emit(collapsed);
  };
  private _collapsed: boolean = false;

  @Output() toggle: EventEmitter<boolean> = new EventEmitter();

  @HostListener('click') click() {
    this.collapsed = !this.collapsed;
  }

  constructor(private renderer: Renderer, private el: ElementRef) { }

  private collapseTarget() {
    this.renderer.setElementClass(this.target, 'igo-collapsed', true);
    this.renderer.setElementClass(this.el.nativeElement, 'collapsed', true);
  }

  private expandTarget() {
    this.renderer.setElementClass(this.target, 'igo-collapsed', false);
    this.renderer.setElementClass(this.el.nativeElement, 'collapsed', false);
  }

}
