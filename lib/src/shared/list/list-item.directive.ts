import { Directive, Input, Output, ElementRef,
         Renderer, HostListener, EventEmitter } from '@angular/core';

@Directive({
  selector: '[igoListItem]'
})
export class ListItemDirective {

  static cls: string = 'igo-list-item-selected';

  @Input()
  get color() { return this._color; }
  set color(value: string) {
    this._color = value;
  }
  private _color: string = 'primary';

  @Input()
  get focused() { return this._focused; }
  set focused(value: boolean) {
    this._focused = value;
    this.renderer.setElementClass(
      this.el.nativeElement, ListItemDirective.cls, value);

    value === true ? this.focus.emit(this) : this.unfocus.emit(this);
  }
  private _focused: boolean = false;

  @Input()
  get selected() { return this._selected; }
  set selected(value: boolean) {
    this._selected = value;
    this._focused = value;
    this.renderer.setElementClass(
      this.el.nativeElement, ListItemDirective.cls, value);

    value === true ? this.select.emit(this) : this.unselect.emit(this);
  }
  private _selected: boolean = false;

  @Output() click_ = new EventEmitter<ListItemDirective>();
  @Output() focus = new EventEmitter<ListItemDirective>();
  @Output() unfocus = new EventEmitter<ListItemDirective>();
  @Output() select = new EventEmitter<ListItemDirective>();
  @Output() unselect = new EventEmitter<ListItemDirective>();

  @HostListener('click') onClick() {
    this.selected = true;
  }

  constructor(public renderer: Renderer, private el: ElementRef) { }

  getOffsetTop(): number {
    const padding = 5;

    return this.el.nativeElement.offsetTop - padding;
  }
}
