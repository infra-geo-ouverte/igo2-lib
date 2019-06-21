import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { EntityRecord } from '../shared/entity.interfaces';
import { EntityStore } from '../shared/store';
import { EntityStoreWatcher } from '../shared/watcher';
import { getEntityTitle } from '../shared/entity.utils';

@Component({
  selector: 'igo-entity-selector',
  templateUrl: './entity-selector.component.html',
  styleUrls: ['./entity-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntitySelectorComponent implements OnInit, OnDestroy {

  /**
   * The selected entity
   * @internal
   */
  selected$ = new BehaviorSubject<object>(undefined);

  /**
   * Subscription to the selected entity
   */
  private selected$$: Subscription;

  /**
   * Store watcher
   */
  private watcher: EntityStoreWatcher<object>;

  /**
   * Entity store
   */
  @Input() store: EntityStore<object>;

  /**
   * Wheter selecting many entities is allowed
   */
  @Input() many: boolean = false;

  /**
   * Title accessor
   */
  @Input() titleAccessor: (object) => string = getEntityTitle;

  /**
   * Text to display when nothing is selected
   */
  @Input() emptyText: string = undefined;

  /**
   * Field placeholder
   */
  @Input() placeholder: string;

  /**
   * Event emitted when the selection changes
   */
  @Output() selectedChange = new EventEmitter<{
    selected: boolean;
    value: object | object[];
  }>();

  constructor(private cdRef: ChangeDetectorRef) {}

  /**
   * Create a store watcher and subscribe to the selected entity
   * @internal
   */
  ngOnInit() {
    this.watcher = new EntityStoreWatcher(this.store, this.cdRef);
    this.selected$$ = this.store.stateView
      .manyBy$((record: EntityRecord<object>) => record.state.selected === true)
      .subscribe((records: EntityRecord<object>[]) => {
        const entities = records.map((record: EntityRecord<object>) => record.entity);
        if (this.many === true) {
          this.selected$.next(entities);
        } else {
          const entity = entities.length > 0 ? entities[0] : undefined;
          this.selected$.next(entity);
        }
      });
  }

  /**
   * Unsubscribe to the selected entity and destroy the store watcher
   * @internal
   */
  ngOnDestroy() {
    this.watcher.destroy();
    this.selected$$.unsubscribe();
  }

  /**
   * On selection change, update the store's state and emit an event
   * @internal
   */
  onSelectionChange(event: {value: object | undefined}) {
    const entities = event.value instanceof Array ? event.value : [event.value];
    if (entities.length === 0) {
      this.store.state.updateAll({selected: false});
    } else {
      this.store.state.updateMany(entities, {selected: true}, true);
    }

    this.selectedChange.emit({selected: true, value: event.value});
  }

}
