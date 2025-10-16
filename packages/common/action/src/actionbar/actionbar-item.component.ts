import { AsyncPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  input,
  output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoIconComponent } from '@igo2/common/icon';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, Subscription, isObservable } from 'rxjs';

import { Action } from '../shared/action.interfaces';

/**
 * An action button
 */
@Component({
  selector: 'igo-actionbar-item',
  templateUrl: './actionbar-item.component.html',
  styleUrls: ['./actionbar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatListModule,
    MatTooltipModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    AsyncPipe,
    IgoLanguageModule,
    IgoIconComponent
  ]
})
export class ActionbarItemComponent implements OnInit, OnDestroy {
  readonly disabled$ = new BehaviorSubject<boolean>(false);

  readonly checkCondition$ = new BehaviorSubject<boolean>(undefined);

  readonly tooltip$ = new BehaviorSubject<string>(undefined);

  readonly noDisplay$ = new BehaviorSubject<boolean>(false);

  readonly ngClass$ = new BehaviorSubject<Record<string, boolean>>({});

  private ngClass$$: Subscription;

  private disabled$$: Subscription;

  private availability$$: Subscription;

  private checkCondition$$: Subscription;

  private tooltip$$: Subscription;

  private noDisplay$$: Subscription;

  private display$$: Subscription;

  isObservable = isObservable;

  /**
   * Action
   */
  readonly action = input<Action>(undefined);

  /**
   * Color
   */
  readonly color = input('default');

  /**
   * Whether the action title is displayed
   */
  readonly withTitle = input(true);

  /**
   * Whether the action icon is displayed
   */
  readonly withIcon = input(true);

  /**
   * Whether a tooltip should be shown
   */
  readonly withTooltip = input(true);

  /**
   * Whether the action is disabled
   */
  @Input()
  set disabled(value: boolean) {
    this.disabled$.next(value);
  }
  get disabled(): boolean {
    return this.disabled$.value;
  }

  /**
   * Whether the action is display or not
   */
  @Input()
  set noDisplay(value: boolean) {
    this.noDisplay$.next(value);
  }
  get noDisplay(): boolean {
    return this.noDisplay$.value;
  }

  /**
   * Event emitted when the action button is clicked
   */
  readonly trigger = output<Action>();

  /**
   * @internal
   */
  get title(): string {
    return this.action().title;
  }

  ngOnInit() {
    const args = this.action().args || [];

    const action = this.action();
    if (action.ngClass !== undefined) {
      this.ngClass$$ = action
        .ngClass(...args)
        .subscribe((ngClass: Record<string, boolean>) =>
          this.updateNgClass(ngClass)
        );
    }

    if (isObservable(action.checkCondition)) {
      this.checkCondition$$ = action.checkCondition.subscribe(
        (checkCondition: boolean) => this.updateCheckCondition(checkCondition)
      );
    } else {
      this.updateCheckCondition(action.checkCondition);
    }

    if (isObservable(action.tooltip)) {
      this.tooltip$$ = action.tooltip.subscribe((tooltip: string) =>
        this.updateTooltip(tooltip)
      );
    } else {
      this.updateTooltip(action.tooltip);
    }

    if (action.availability !== undefined) {
      this.availability$$ = action
        .availability(...args)
        .subscribe((available: boolean) => (this.disabled = !available));
    }

    this.disabled$$ = this.disabled$.subscribe((disabled: boolean) =>
      this.updateNgClass({ 'igo-actionbar-item-disabled': disabled })
    );

    if (action.display !== undefined) {
      this.display$$ = action
        .display(...args)
        .subscribe((display: boolean) => (this.noDisplay = !display));
    }

    this.noDisplay$$ = this.noDisplay$.subscribe((noDisplay: boolean) =>
      this.updateNgClass({ 'igo-actionbar-item-no-display': noDisplay })
    );
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

    if (this.checkCondition$$ !== undefined) {
      this.checkCondition$$.unsubscribe();
      this.checkCondition$$ = undefined;
    }

    if (this.tooltip$$ !== undefined) {
      this.tooltip$$.unsubscribe();
      this.tooltip$$ = undefined;
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
    this.trigger.emit(this.action());
  }

  private updateNgClass(ngClass: Record<string, boolean>) {
    this.ngClass$.next(Object.assign({}, this.ngClass$.value, ngClass));
  }

  private updateTooltip(tooltip: string) {
    this.tooltip$.next(tooltip);
  }

  private updateCheckCondition(checkCondition: boolean) {
    this.checkCondition$.next(checkCondition);
  }
}
