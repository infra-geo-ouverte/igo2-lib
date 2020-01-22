import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { Action } from '../shared/action.interfaces';

 /**
  * An action button
  */
@Component({
  selector: 'igo-actionbar-item',
  templateUrl: './actionbar-item.component.html',
  styleUrls: ['./actionbar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionbarItemComponent implements OnInit, OnDestroy {

  readonly disabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  readonly noDisplay$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  readonly ngClass$: BehaviorSubject<{[key: string]: boolean}> = new BehaviorSubject({});

  private ngClass$$: Subscription;

  private disabled$$: Subscription;

  private availability$$: Subscription;

  private noDisplay$$: Subscription;

  private display$$: Subscription;

  /**
   * Action
   */
  @Input() action: Action;

  /**
   * Color
   */
  @Input() color = 'default';

  /**
   * Whether the action title is displayed
   */
  @Input() withTitle = true;

  /**
   * Whether the action icon is displayed
   */
  @Input() withIcon = true;

  /**
   * Whether a tooltip should be shown
   */
  @Input() withTooltip = true;

  /**
   * Whether the action is disabled
   */
  @Input()
  set disabled(value: boolean) { this.disabled$.next(value); }
  get disabled(): boolean { return this.disabled$.value; }

  /**
   * Whether the action is display or not
   */
  @Input()
  set noDisplay(value: boolean) { this.noDisplay$.next(value); }
  get noDisplay(): boolean { return this.noDisplay$.value; }

  /**
   * Event emitted when the action button is clicked
   */
  @Output() trigger: EventEmitter<Action> = new EventEmitter();

  /**
   * @internal
   */
  get title(): string { return this.action.title; }

  /**
   * @internal
   */
  get tooltip(): string { return this.action.tooltip || this.title; }

  /**
   * @internal
   */
  get icon(): string { return this.action.icon; }

  constructor() {}

  ngOnInit() {
    const args = this.action.args || [];

    if (this.action.ngClass !== undefined) {
      this.ngClass$$ = this.action.ngClass(...args)
        .subscribe((ngClass: {[key: string]: boolean}) => this.updateNgClass(ngClass));
    }

    if (this.action.availability !== undefined) {
      this.availability$$ = this.action.availability(...args)
        .subscribe((available: boolean) => this.disabled = !available);
    }

    this.disabled$$ = this.disabled$
      .subscribe((disabled: boolean) => this.updateNgClass({'igo-actionbar-item-disabled': disabled}));

    if (this.action.display !== undefined) {
      this.display$$ = this.action.display(...args)
        .subscribe((display: boolean) => this.noDisplay = !display);
    }

    this.noDisplay$$ = this.noDisplay$
      .subscribe((noDisplay: boolean) => this.updateNgClass({'igo-actionbar-item-no-display': noDisplay}));
  }

  ngOnDestroy() {
    if (this.ngClass$$ !== undefined) {
      this.ngClass$$.unsubscribe();
      this.ngClass$$ = undefined;
    }

    if (this.availability$$ !== undefined) {
      this.availability$$.unsubscribe();
      this.availability$$ = undefined;
    }

    if (this.display$$ !== undefined) {
      this.display$$.unsubscribe();
      this.display$$ = undefined;
    }

    this.disabled$$.unsubscribe();
    this.noDisplay$$.unsubscribe();
  }

  /**
   * When the action button is clicked, emit the 'trigger' event but don't
   * invoke the action handler. This is handled by the parent component.
   * @internal
   */
  onClick() {
    if (this.disabled === true) {
      return;
    }
    this.trigger.emit(this.action);
  }

  private updateNgClass(ngClass: {[key: string]: boolean}) {
    this.ngClass$.next(Object.assign({}, this.ngClass$.value, ngClass));
  }
}
