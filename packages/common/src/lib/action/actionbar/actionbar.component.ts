import {
  Component,
  Input,
  HostBinding,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';

import { EntityStoreWatcher } from '../../entity';
import { Action } from '../shared/action.interfaces';
import { ActionbarMode } from '../shared/action.enums';
import { ActionStore } from '../shared/store';
import { Overlay } from '@angular/cdk/overlay';

/**
 * A list of action buttons.
 * This component can be displayed in one of two way: 'dock' or 'overlay'
 */
@Component({
  selector: 'igo-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionbarComponent implements OnDestroy, OnChanges {
  static defaultItemClassFunc(action: Action) {
    return {};
  }

  /**
   * Reference to the ActionbarMode enum for use in the template
   * @internal
   */
  actionbarMode = ActionbarMode;

  /**
   * Whether the actionbar is collapsed (Dock mode)
   * @internal
   */
  collapsed = false;

  /**
   * Toggle collapse action (Dock)
   * @internal
   */
  toggleCollapseAction = {
    id: 'actionbar_toggle',
    icon: 'more_vert',
    handler: () => {
      this.collapsed = !this.collapsed;
    }
  };

  /**
   * Action store watcher
   * @internal
   */
  private watcher: EntityStoreWatcher<Action>;

  /**
   * Action store
   */
  @Input() store: ActionStore;

  /**
   * Actionbar mode
   */
  @Input() mode: ActionbarMode = ActionbarMode.Dock;

  /**
   * Whether a toggle button should be displayed (Dock mode)
   */
  @Input() withToggleButton = false;

  /**
   * Whether a the actionbar should display buttons horizontally
   */
  @Input() horizontal = false;

  /**
   * Color
   */
  @Input() color = 'default';

  /**
   * Whether action titles are displayed
   */
  @Input() withTitle = true;

  /**
   * Whether action icons are displayed
   */
  @Input() withIcon = true;

  /**
   * Overlay X position
   */
  @Input() xPosition = 'before';

  /**
   * Overlay X position
   */
  @Input() yPosition = 'above';

  /**
   * Class to add to the actionbar overlay
   */
  @Input()
  set overlayClass(value: string) {
    this._overlayClass = value;
  }
  get overlayClass(): string {
    return [this._overlayClass, 'igo-actionbar-overlay'].join(' ');
  }
  private _overlayClass = '';

  /**
   * Function to add class to item actionbar
   */
  @Input() itemClassFunc: (action: Action) => { [key: string]: boolean } =
    ActionbarComponent.defaultItemClassFunc;

  /**
   * @ignore
   */
  @HostBinding('class.with-title')
  get withTitleClass() {
    return this.withTitle;
  }

  /**
   * @ignore
   */
  @HostBinding('class.with-icon')
  get withIconClass() {
    return this.withIcon;
  }

  /**
   * @ignore
   */
  @HostBinding('class.horizontal')
  get horizontalClass() {
    return this.horizontal;
  }

  constructor(private cdRef: ChangeDetectorRef, public overlay: Overlay) {}

  /**
   * @internal
   */
  ngOnChanges(changes: SimpleChanges) {
    const store = changes.store;
    if (store && store.currentValue !== store.previousValue) {
      if (this.watcher !== undefined) {
        this.watcher.destroy();
      }
      this.watcher = new EntityStoreWatcher(this.store, this.cdRef);
    }
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.watcher.destroy();
  }

  /**
   * Invoke the action handler
   * @internal
   */
  onTriggerAction(action: Action) {
    const args = action.args || [];
    action.handler(...args);
  }
}
