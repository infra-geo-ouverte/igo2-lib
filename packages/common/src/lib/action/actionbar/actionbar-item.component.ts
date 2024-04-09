import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subscription, isObservable } from 'rxjs';

import { IgoIconComponent } from '../../icons';
import { Action } from '../shared/action.interfaces';

/**
 * An action button
 */
@Component({
  selector: 'igo-actionbar-item',
  templateUrl: './actionbar-item.component.html',
  styleUrls: ['./actionbar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatListModule,
    MatTooltipModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    AsyncPipe,
    TranslateModule,
    IgoIconComponent
  ]
})
export class ActionbarItemComponent implements OnInit, OnDestroy {
  readonly disabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  readonly checkCondition$: BehaviorSubject<boolean> = new BehaviorSubject(
    undefined
  );

  readonly tooltip$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  readonly noDisplay$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  readonly ngClass$: BehaviorSubject<{ [key: string]: boolean }> =
    new BehaviorSubject({});

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
  @Output() trigger: EventEmitter<Action> = new EventEmitter();

  /**
   * @internal
   */
  get title(): string {
    return this.action.title;
  }

  ngOnInit() {
    const args = this.action.args || [];

    if (this.action.ngClass !== undefined) {
      this.ngClass$$ = this.action
        .ngClass(...args)
        .subscribe((ngClass: { [key: string]: boolean }) =>
          this.updateNgClass(ngClass)
        );
    }

    if (isObservable(this.action.checkCondition)) {
      this.checkCondition$$ = this.action.checkCondition.subscribe(
        (checkCondition: boolean) => this.updateCheckCondition(checkCondition)
      );
    } else {
      this.updateCheckCondition(this.action.checkCondition);
    }

    if (isObservable(this.action.tooltip)) {
      this.tooltip$$ = this.action.tooltip.subscribe((tooltip: string) =>
        this.updateTooltip(tooltip)
      );
    } else {
      this.updateTooltip(this.action.tooltip);
    }

    if (this.action.availability !== undefined) {
      this.availability$$ = this.action
        .availability(...args)
        .subscribe((available: boolean) => (this.disabled = !available));
    }

    this.disabled$$ = this.disabled$.subscribe((disabled: boolean) =>
      this.updateNgClass({ 'igo-actionbar-item-disabled': disabled })
    );

    if (this.action.display !== undefined) {
      this.display$$ = this.action
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
    this.trigger.emit(this.action);
  }

  private updateNgClass(ngClass: { [key: string]: boolean }) {
    this.ngClass$.next(Object.assign({}, this.ngClass$.value, ngClass));
  }

  private updateTooltip(tooltip: string) {
    this.tooltip$.next(tooltip);
  }

  private updateCheckCondition(checkCondition: boolean) {
    this.checkCondition$.next(checkCondition);
  }
}
