import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  inject,
  output
} from '@angular/core';

@Directive({
  selector: '[igoListItem]',
  standalone: true
})
export class ListItemDirective {
  renderer = inject(Renderer2);
  el = inject(ElementRef);

  static focusedCls = 'igo-list-item-focused';
  static selectedCls = 'igo-list-item-selected';
  static disabledCls = 'igo-list-item-disabled';

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
    if (this.disabled) {
      return;
    }

    value ? this.beforeFocus.emit(this) : this.beforeUnfocus.emit(this);

    this._focused = value;
    if (this.selected !== true) {
      this.toggleFocusedClass();
    }

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
    if (this.disabled) {
      return;
    }

    value ? this.beforeSelect.emit(this) : this.beforeUnselect.emit(this);

    this._selected = value;
    this._focused = value;
    this.toggleSelectedClass();

    value ? this.select.emit(this) : this.unselect.emit(this);
  }
  private _selected = false;

  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(value: boolean) {
    if (value === this._disabled) {
      return;
    }

    if (value === true) {
      this.selected = false;
    }

    value ? this.beforeDisable.emit(this) : this.beforeEnable.emit(this);

    this._disabled = value;
    this.toggleDisabledClass();

    value ? this.disable.emit(this) : this.enable.emit(this);
  }
  private _disabled = false;

  readonly beforeSelect = output<ListItemDirective>();
  readonly beforeFocus = output<ListItemDirective>();
  readonly beforeUnselect = output<ListItemDirective>();
  readonly beforeUnfocus = output<ListItemDirective>();
  readonly beforeDisable = output<ListItemDirective>();
  readonly beforeEnable = output<ListItemDirective>();
  readonly focus = output<ListItemDirective>();
  readonly unfocus = output<ListItemDirective>();
  readonly select = output<ListItemDirective>();
  readonly unselect = output<ListItemDirective>();
  readonly disable = output<ListItemDirective>();
  readonly enable = output<ListItemDirective>();

  @HostListener('click')
  onClick() {
    this.selected = true;
  }

  getOffsetTop(): number {
    const padding = 5;

    return this.el.nativeElement.offsetTop - padding;
  }

  private toggleFocusedClass() {
    if (this.focused) {
      this.addCls(ListItemDirective.focusedCls);
    } else {
      this.removeCls(ListItemDirective.focusedCls);
    }
  }

  private toggleSelectedClass() {
    if (this.selected) {
      this.addCls(ListItemDirective.selectedCls);
      this.removeCls(ListItemDirective.focusedCls);
    } else {
      this.removeCls(ListItemDirective.selectedCls);
    }
  }

  private toggleDisabledClass() {
    if (this.disabled) {
      this.addCls(ListItemDirective.disabledCls);
    } else {
      this.removeCls(ListItemDirective.disabledCls);
    }
  }

  private addCls(cls: string) {
    this.renderer.addClass(this.el.nativeElement, cls);
  }

  private removeCls(cls: string) {
    this.renderer.removeClass(this.el.nativeElement, cls);
  }
}
