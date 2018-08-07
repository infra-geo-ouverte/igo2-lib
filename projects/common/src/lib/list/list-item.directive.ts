import {
  Directive,
  Input,
  Output,
  ElementRef,
  Renderer2,
  HostListener,
  EventEmitter
} from '@angular/core';

@Directive({
  selector: '[igoListItem]'
})
export class ListItemDirective {
  static cls = 'igo-list-item-selected';

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  @Input()
  get focused() {
    return this._focused;
  }
  set focused(value: boolean) {
    if (value === this._focused) {
      return;
    }

    value ? this.beforeFocus.emit(this) : this.beforeUnfocus.emit(this);

    if (value) {
      this.renderer.addClass(this.el.nativeElement, ListItemDirective.cls);
    } else {
      this.renderer.removeClass(this.el.nativeElement, ListItemDirective.cls);
    }

    this._focused = value;

    value ? this.focus.emit(this) : this.unfocus.emit(this);
  }
  private _focused = false;

  @Input()
  get selected() {
    return this._selected;
  }
  set selected(value: boolean) {
    if (value === this._selected) {
      return;
    }

    value ? this.beforeSelect.emit(this) : this.beforeUnselect.emit(this);

    if (value) {
      this.renderer.addClass(this.el.nativeElement, ListItemDirective.cls);
    } else {
      this.renderer.removeClass(this.el.nativeElement, ListItemDirective.cls);
    }

    this._selected = value;
    this._focused = value;

    value ? this.select.emit(this) : this.unselect.emit(this);
  }
  private _selected = false;

  @Output() beforeSelect = new EventEmitter<ListItemDirective>();
  @Output() beforeFocus = new EventEmitter<ListItemDirective>();
  @Output() beforeUnselect = new EventEmitter<ListItemDirective>();
  @Output() beforeUnfocus = new EventEmitter<ListItemDirective>();
  @Output() focus = new EventEmitter<ListItemDirective>();
  @Output() unfocus = new EventEmitter<ListItemDirective>();
  @Output() select = new EventEmitter<ListItemDirective>();
  @Output() unselect = new EventEmitter<ListItemDirective>();

  @HostListener('click')
  onClick() {
    this.selected = true;
  }

  constructor(public renderer: Renderer2, private el: ElementRef) {}

  getOffsetTop(): number {
    const padding = 5;

    return this.el.nativeElement.offsetTop - padding;
  }
}
