import { Overlay } from '@angular/cdk/overlay';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  MatMenuModule,
  MenuPositionX,
  MenuPositionY
} from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EntityStoreWatcher } from '@igo2/common/entity';
import { IgoLanguageModule } from '@igo2/core/language';
import { Media, MediaService } from '@igo2/core/media';

import { BehaviorSubject } from 'rxjs';

import { ActionbarMode } from '../shared/action.enums';
import { Action } from '../shared/action.interfaces';
import { ActionStore } from '../shared/store';
import { ActionbarItemComponent } from './actionbar-item.component';

/**
 * A list of action buttons.
 * This component can be displayed in one of two way: 'dock' or 'overlay'
 */
@Component({
  selector: 'igo-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    ActionbarItemComponent,
    NgFor,
    MatMenuModule,
    MatCardModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class ActionbarComponent implements OnDestroy, OnChanges {
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
   * Height Condition for scroll button
   */
  heightCondition$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  /**
   * Position Condition for top scroll button
   */
  positionConditionTop$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);

  /**
   * Position Condition for low scroll button
   */
  positionConditionLow$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);

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
   * Color of the button if action mode === overlay
   */
  @Input() iconColor = 'default';

  /**
   * Whether action titles are displayed
   */
  @Input() withTitle = true;

  /**
   * Whether action tooltips are displayed
   */
  @Input() withTooltip = true;

  /**
   * Whether action titles are displayed (condition for scroll button)
   */
  @Input() scrollActive = true;

  /**
   * Whether action icons are displayed
   */
  @Input() withIcon = true;

  /**
   * Which icon want to be shown
   */
  @Input() icon = 'more_horiz';

  /**
   * Overlay X position
   */
  @Input() xPosition: MenuPositionX = 'before';

  /**
   * Overlay Y position
   */
  @Input() yPosition: MenuPositionY = 'above';

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

  @HostBinding('class.is-collapsed') isCollapsed = this.collapsed;

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

  get heightCondition(): boolean {
    const el = this.elRef.nativeElement;
    if (this.scrollActive === false) {
      if (el.clientHeight < el.scrollHeight) {
        return true;
      }
    }
    return false;
  }

  get positionConditionTop(): boolean {
    if (this.elRef.nativeElement.scrollTop === 0) {
      return false;
    }
    return true;
  }

  get positionConditionLow(): boolean {
    const el = this.elRef.nativeElement;
    if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
      return false;
    }
    return true;
  }

  get isDesktop(): boolean {
    return this.mediaService.getMedia() === Media.Desktop;
  }

  constructor(
    public overlay: Overlay,
    private elRef: ElementRef,
    private cdRef: ChangeDetectorRef,
    public mediaService: MediaService
  ) {}

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

  scrollDown() {
    this.elRef.nativeElement.scrollBy(0, 52);
  }

  scrollUp() {
    this.elRef.nativeElement.scrollBy(0, -52);
  }
}
