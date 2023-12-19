import { BehaviorSubject, Subject, Subscription } from 'rxjs';

import { ActionStore } from '../../action';
import { EntityStoreWithStrategy } from '../../entity';
import { Widget } from '../../widget';
import { WorkspaceOptions } from './workspace.interfaces';

/**
 * This class is responsible of managing the relations between
 * entities and the actions that consume them. It also defines an
 * entity table template that may be used by an entity table component.
 */
export class Workspace<E extends object = object> {
  /**
   * Observable of the selected widget
   */
  readonly widget$ = new BehaviorSubject<Widget>(undefined);

  /**
   * Observable of the selected widget's inputs
   */
  readonly widgetInputs$ = new BehaviorSubject<{ [key: string]: any }>({});

  /**
   * Observable of the selected widget's subscribers
   */
  readonly widgetSubscribers$ = new BehaviorSubject<{
    [key: string]: (event: any) => void;
  }>({});

  /**
   * Subscription to the selected entity
   */
  private entities$$: Subscription;

  /**
   * State change that trigger an update of the actions availability
   */
  private change: Subject<void> = new Subject();

  /**
   * Subscription to state changes
   */
  private change$: Subscription;

  /**
   * Workspace id
   */
  get id(): string {
    return this.options.id;
  }

  /**
   * Workspace title
   */
  get title(): string {
    return this.options.title;
  }

  /**
   * Workspace title
   */
  get meta(): { [key: string]: any } {
    return this.options.meta || {};
  }

  /**
   * Entities store
   */
  get entityStore(): EntityStoreWithStrategy<E> {
    return this.options.entityStore as EntityStoreWithStrategy<E>;
  }

  /**
   * Actions store (some actions activate a widget)
   */
  get actionStore(): ActionStore {
    return this.options.actionStore;
  }

  /**
   * Selected widget
   */
  get widget(): Widget {
    return this.widget$.value;
  }

  /**
   * Whether a widget is selected
   */
  get hasWidget(): boolean {
    return this.widget !== undefined;
  }

  constructor(protected options: WorkspaceOptions) {}

  /**
   * Whether this strategy is active
   * @internal
   */
  get active(): boolean {
    return this.active$.value;
  }
  readonly active$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Activate the workspace. By doing that, the workspace will observe
   * the selected entity (from the store) and update the actions availability.
   * For example, some actions require an entity to be selected.
   */
  activate() {
    if (this.active === true) {
      this.deactivate();
    }
    this.active$.next(true);

    if (this.entityStore !== undefined) {
      this.entities$$ = this.entityStore.stateView
        .all$()
        .subscribe(() => this.onStateChange());
    }

    this.change.next();
  }

  /**
   * Deactivate the workspace. Unsubcribe to the selected entity.
   */
  deactivate() {
    this.active$.next(false);
    this.deactivateWidget();

    if (this.entities$$ !== undefined) {
      this.entities$$.unsubscribe();
    }
    if (this.change$ !== undefined) {
      this.change$.unsubscribe();
    }
  }

  /**
   * Activate a widget. In itself, activating a widget doesn't render it but,
   * if an WorkspaceWidgetOutlet component is bound to this workspace, the widget will
   * show up.
   * @param widget Widget
   * @param inputs Inputs the widget will receive
   */
  activateWidget(
    widget: Widget,
    inputs: { [key: string]: any } = {},
    subscribers: { [key: string]: (event: any) => void } = {}
  ) {
    this.widget$.next(widget);
    this.widgetInputs$.next(inputs);
    this.widgetSubscribers$.next(subscribers);
    this.change.next();
  }

  /**
   * Deactivate a widget.
   */
  deactivateWidget() {
    this.widget$.next(undefined);
    this.change.next();
  }

  /**
   * When the state changes, update the actions availability.
   */
  private onStateChange() {
    this.change.next();
  }
}
