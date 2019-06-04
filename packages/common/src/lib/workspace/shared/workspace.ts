import { Subscription, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ActionStore } from '../../action';
import { Widget } from '../../widget';
import { EntityRecord, EntityStore } from '../../entity';

import { WorkspaceOptions } from './workspace.interfaces';

/**
 * This class is responsible of managing the relations between
 * entities and the actions that consume them. It also defines an
 * entity table template that may be used by an entity table component.
 */
export class Workspace<E extends object = object> {

  /**
   * Observable of the selected entity
   */
  public entity$ = new BehaviorSubject<E>(undefined);

  /**
   * Observable of the selected widget
   */
  public widget$ = new BehaviorSubject<Widget>(undefined);

  /**
   * Observable of the selected widget's inputs
   */
  public widgetInputs$ = new BehaviorSubject<{[key: string]: any}>({});

  /**
   * Observable of the selected widget's subscribers
   */
  public widgetSubscribers$ = new BehaviorSubject<{[key: string]: (event: any) => void}>({});

  /**
   * Subscription to the selected entity
   */
  private entities$$: Subscription;

  /**
   * Whether this workspace is active
   */
  private active: boolean = false;

  /**
   * State change that trigger an update of the actions availability
   */
  private changes$: Subject<void> = new Subject();

  /**
   * Subscription to state changes
   */
  private changes$$: Subscription;

  /**
   * Workspace id
   */
  get id(): string { return this.options.id; }

  /**
   * Workspace title
   */
  get title(): string { return this.options.title; }

  /**
   * Workspace title
   */
  get meta(): {[key: string]: any} { return this.options.meta || {}; }

  /**
   * Entities store
   */
  get entityStore(): EntityStore<E> { return this.options.entityStore as EntityStore<E>; }

  /**
   * Actions store (some actions activate a widget)
   */
  get actionStore(): ActionStore { return this.options.actionStore; }

  /**
   * Selected entity
   */
  get entity(): E { return this.entity$.value; }

  /**
   * Selected widget
   */
  get widget(): Widget { return this.widget$.value; }

  /**
   * Whether a widget is selected
   */
  get hasWidget(): boolean { return this.widget !== undefined; }

  constructor(protected options: WorkspaceOptions) {}

  /**
   * Whether this workspace is active
   */
  isActive(): boolean { return this.active; }

  /**
   * Activate the workspace. By doing that, the workspace will observe
   * the selected entity (from the store) and update the actions availability.
   * For example, some actions require an entity to be selected.
   */
  activate() {
    if (this.active === true) {
      this.deactivate();
    }
    this.active = true;

    if (this.entityStore !== undefined) {
      this.entities$$ = this.entityStore.stateView
        .manyBy$((record: EntityRecord<E>) => record.state.selected === true)
        .subscribe((records: EntityRecord<E>[]) => {
          // If more than one entity is selected, consider that no entity at all is selected.
          const entity = (records.length === 0 || records.length > 1) ? undefined : records[0].entity;
          this.onSelectEntity(entity);
        });
    }

    if (this.actionStore !== undefined) {
      this.changes$$ = this.changes$
        .pipe(debounceTime(50))
        .subscribe(() => this.actionStore.updateActionsAvailability());
    }

    this.changes$.next();
  }

  /**
   * Deactivate the workspace. Unsubcribe to the selected entity.
   */
  deactivate() {
    this.active = false;
    this.deactivateWidget();

    if (this.entities$$ !== undefined) {
      this.entities$$.unsubscribe();
    }
    if (this.changes$$ !== undefined) {
      this.changes$$.unsubscribe();
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
    inputs: {[key: string]: any} = {},
    subscribers: {[key: string]: (event: any) => void} = {}
  ) {
    this.widget$.next(widget);
    this.widgetInputs$.next(inputs);
    this.widgetSubscribers$.next(subscribers);
  }

  /**
   * Deactivate a widget.
   */
  deactivateWidget() {
    this.widget$.next(undefined);
    this.changes$.next();
  }

  /**
   * When an entity is selected, keep a reference to that
   * entity and update the actions availability.
   * @param entity Entity
   */
  private onSelectEntity(entity: E) {
    if (entity === this.entity$.value) {
      return;
    }
    this.entity$.next(entity);
    this.changes$.next();
  }

}
