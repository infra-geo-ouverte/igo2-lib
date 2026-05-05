import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  contentChildren,
  effect,
  inject
} from '@angular/core';
import { MatListModule } from '@angular/material/list';

import { ClickoutDirective } from '@igo2/common/clickout';

// subscriptions can be rxjs Subscription or OutputRefSubscription-like objects

import { ListItemDirective } from './list-item.directive';

@Component({
  selector: 'igo-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [MatListModule, ClickoutDirective, NgClass]
})
export class ListComponent implements AfterViewInit, OnInit, OnDestroy {
  private el = inject(ElementRef);

  @Input()
  get navigation() {
    return this._navigation;
  }
  set navigation(value: boolean) {
    this._navigation = value;
  }
  private _navigation = true;

  @Input()
  get selection() {
    return this._selection;
  }
  set selection(value: boolean) {
    this._selection = value;
  }
  private _selection = true;

  get selectedItem() {
    return this._selectedItem;
  }
  set selectedItem(value: ListItemDirective) {
    this.focusedItem = value;
    this._selectedItem = value;
  }
  private _selectedItem: ListItemDirective;

  get focusedItem() {
    return this._focusedItem;
  }
  set focusedItem(value: ListItemDirective) {
    this._focusedItem = value;
  }
  private _focusedItem: ListItemDirective;

  private navigationEnabled: boolean;
  // Accept both rxjs Subscription and Angular signal OutputRefSubscription
  private subscriptions: { unsubscribe: () => void }[] = [];
  private listItemsEffect = effect(() => {
    this.listItems();
    this.init();
  });

  readonly listItems = contentChildren(ListItemDirective, {
    descendants: true
  });

  @HostListener('document:keydown', ['$event'])
  @HostListener('document:enter', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // It would be nice to be able to unsubscribe to the event
    // completely but until ES7 this won't be possible because
    // document events are not observables
    if (this.navigationEnabled) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.navigate(event.key);
      } else if (event.key === 'Enter') {
        this.select(this.focusedItem);
      }
    }
  }

  ngOnInit() {
    this.enableNavigation();
  }

  ngAfterViewInit() {
    const listItems = this.listItems();
    if (listItems.length) {
      this.init();
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
    if (this.listItemsEffect) {
      this.listItemsEffect.destroy();
      this.listItemsEffect = undefined;
    }
  }

  focus(item?: ListItemDirective) {
    if (!this.selection) {
      return;
    }

    this.unfocus();

    // We need to make this check because dynamic
    // lists such as in the search results list may fail
    if (item !== undefined) {
      item.focused = true;
    }
  }

  unfocus() {
    if (this.focusedItem !== undefined) {
      this.focusedItem.focused = false;
    }

    this.focusedItem = undefined;
  }

  focusNext() {
    const items = this.listItems();
    let item;
    const igoList = this.el.nativeElement;
    let disabled = true;
    let index = this.getFocusedIndex();
    if (index === undefined) {
      index = -1;
    }

    while (disabled && index < items.length - 1) {
      index += 1;
      item = items[index];
      disabled = item.disabled;
    }

    if (item !== undefined) {
      this.focus(item);
    }

    if (!items[index + 1]) {
      igoList.scrollTop = igoList.scrollHeight - igoList.clientHeight;
      return;
    }

    if (item !== undefined && !this.isScrolledIntoView(item.el.nativeElement)) {
      igoList.scrollTop =
        item.el.nativeElement.offsetTop +
        item.el.nativeElement.children[0].offsetHeight -
        igoList.clientHeight;
    }
  }

  focusPrevious() {
    const items = this.listItems();
    let item: ListItemDirective;
    const igoList = this.el.nativeElement;
    let disabled = true;
    let index = this.getFocusedIndex();

    while (disabled && index > 0) {
      index -= 1;
      item = items[index];
      disabled = item.disabled;
    }

    if (item !== undefined) {
      this.focus(item);
    }

    if (!items[index - 1]) {
      igoList.scrollTop = 0;
      return;
    }

    if (item !== undefined && !this.isScrolledIntoView(item.el.nativeElement)) {
      const padding = 3;
      igoList.scrollTop = item.el.nativeElement.offsetTop - padding;
    }
  }

  select(item?: ListItemDirective) {
    if (!this.selection) {
      return;
    }

    this.unselect();

    if (item !== undefined) {
      item.selected = true;
    }
  }

  unselect() {
    this.unfocus();

    if (this.selectedItem !== undefined) {
      this.selectedItem.selected = false;
    }

    this.selectedItem = undefined;
  }

  enableNavigation() {
    if (this.navigation) {
      this.navigationEnabled = true;
    }
  }

  disableNavigation() {
    this.navigationEnabled = false;
  }

  scrollToItem(item: ListItemDirective) {
    this.el.nativeElement.scrollTop = item.getOffsetTop();
  }

  isScrolledIntoView(elem) {
    const docViewTop =
      this.el.nativeElement.scrollTop + this.el.nativeElement.offsetTop;
    const docViewBottom = docViewTop + this.el.nativeElement.clientHeight;

    const elemTop = elem.offsetTop;
    const elemBottom = elemTop + elem.children[0].offsetHeight;
    return elemBottom <= docViewBottom && elemTop >= docViewTop;
  }

  private init() {
    this.subscribe();

    this.selectedItem = this.findSelectedItem();
    this.focusedItem = this.findFocusedItem();

    this.enableNavigation();
  }

  private subscribe() {
    this.unsubscribe();

    this.listItems().forEach((item) => {
      this.subscriptions.push(
        item.beforeSelect.subscribe((item2: ListItemDirective) =>
          this.handleItemBeforeSelect(item2)
        )
      );

      this.subscriptions.push(
        item.select.subscribe((item2: ListItemDirective) =>
          this.handleItemSelect(item2)
        )
      );

      this.subscriptions.push(
        item.beforeFocus.subscribe((item2: ListItemDirective) =>
          this.handleItemBeforeFocus(item2)
        )
      );

      this.subscriptions.push(
        item.focus.subscribe((item2: ListItemDirective) =>
          this.handleItemFocus(item2)
        )
      );
    }, this);
  }

  private unsubscribe() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private handleItemBeforeFocus(item: ListItemDirective) {
    if (item !== this.focusedItem) {
      this.unfocus();
    }
  }

  private handleItemFocus(item: ListItemDirective) {
    this.focusedItem = item;
  }

  private handleItemBeforeSelect(item: ListItemDirective) {
    if (item !== this.focusedItem) {
      this.unselect();
    }
  }

  private handleItemSelect(item: ListItemDirective) {
    this.selectedItem = item;
  }

  private findSelectedItem() {
    return this.listItems().find((item) => item.selected);
  }

  private findFocusedItem() {
    return this.listItems().find((item) => item.focused);
  }

  private getFocusedIndex() {
    return this.listItems().findIndex((item) => item === this.focusedItem);
  }

  private navigate(key: string) {
    switch (key) {
      case 'ArrowUp':
        this.focusPrevious();
        break;
      case 'ArrowDown':
        this.focusNext();
        break;
      default:
        break;
    }
  }
}
