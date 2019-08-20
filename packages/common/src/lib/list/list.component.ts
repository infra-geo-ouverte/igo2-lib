import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  QueryList,
  Input,
  ContentChildren,
  HostListener,
  ElementRef
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ListItemDirective } from './list-item.directive';

@Component({
  selector: 'igo-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements AfterViewInit, OnInit, OnDestroy {
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
  private listItems$$: Subscription;
  private subscriptions: Subscription[] = [];

  @ContentChildren(ListItemDirective, { descendants: true })
  listItems: QueryList<ListItemDirective>;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // It would be nice to be able to unsubscribe to the event
    // completely but until ES7 this won't be possible because
    // document events are not observables
    if (this.navigationEnabled) {
      if (event.keyCode === 38 || event.keyCode === 40) {
        event.preventDefault();
        this.navigate(event.keyCode);
      } else if (event.keyCode === 13) {
        this.select(this.focusedItem);
      }
    }
  }

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.enableNavigation();
  }

  ngAfterViewInit() {
    if (this.listItems.length) {
      this.init();
    }

    this.listItems$$ = this.listItems.changes.subscribe(
      (items: ListItemDirective[]) => this.init()
    );
  }

  ngOnDestroy() {
    this.listItems$$.unsubscribe();
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
    const items = this.listItems.toArray();
    let item;
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
  }

  focusPrevious() {
    const items = this.listItems.toArray();
    let item;
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

  private init() {
    this.subscribe();

    this.selectedItem = this.findSelectedItem();
    this.focusedItem = this.findFocusedItem();

    this.enableNavigation();
  }

  private subscribe() {
    this.unsubscribe();

    this.listItems.toArray().forEach(item => {
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
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private handleItemBeforeFocus(item: ListItemDirective) {
    if (item !== this.focusedItem) {
      this.unselect();
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
    return this.listItems.toArray().find(item => item.selected);
  }

  private findFocusedItem() {
    return this.listItems.toArray().find(item => item.focused);
  }

  private getFocusedIndex() {
    return this.listItems
      .toArray()
      .findIndex(item => item === this.focusedItem);
  }

  private navigate(key: number) {
    switch (key) {
      case 38:
        this.focusPrevious();
        break;
      case 40:
        this.focusNext();
        break;
      default:
        break;
    }
  }
}
