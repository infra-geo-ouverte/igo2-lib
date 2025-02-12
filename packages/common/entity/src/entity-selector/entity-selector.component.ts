import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { BehaviorSubject, Subscription } from 'rxjs';

import { EntityRecord } from '../shared/entity.interfaces';
import { getEntityTitle } from '../shared/entity.utils';
import { EntityStore } from '../shared/store';
import { EntityStoreWatcher } from '../shared/watcher';

export interface EntitySelectorChange<T = any> {
  selected: boolean;
  value: T;
}
@Component({
    selector: 'igo-entity-selector',
    templateUrl: './entity-selector.component.html',
    styleUrls: ['./entity-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatFormFieldModule,
        MatSelectModule,
        NgIf,
        MatOptionModule,
        NgFor,
        AsyncPipe
    ]
})
export class EntitySelectorComponent implements OnInit, OnDestroy {
  /**
   * The selected entity
   * @internal
   */
  readonly selected$ = new BehaviorSubject<object>(undefined);

  /**
   * The current multi select option text
   * @internal
   */
  readonly multiText$ = new BehaviorSubject<string>(undefined);

  readonly multiSelectValue = { id: 'IGO_MULTI_SELECT' };

  readonly emptyValue = { id: 'IGO_EMPTY_SELECT' };

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
   * Title accessor
   */
  @Input() titleAccessor: (object) => string = getEntityTitle;

  /**
   * Text to display when nothing is selected
   */
  @Input() emptyText: string = undefined;

  /**
   * Wheter selecting many entities is allowed
   */
  @Input() multi = false;

  /**
   * Text to display for the select all option
   */
  @Input() multiAllText = 'All';

  /**
   * Text to display for the select none option
   */
  @Input() multiNoneText = 'None';

  /**
   * Field placeholder
   */
  @Input() placeholder: string;

  /**
   * Wheter the selector is disabled or not
   */
  @Input() disabled = false;

  /**
   * Event emitted when the selection changes
   */
  @Output() selectedChange = new EventEmitter<EntitySelectorChange>();

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
        const entities = records.map(
          (record: EntityRecord<object>) => record.entity
        );
        this.onSelectFromStore(entities);
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
  onSelectionChange(event: { value: object | undefined }) {
    const values = event.value instanceof Array ? event.value : [event.value];

    const multiSelect = values.find(
      (_value: object) => _value === this.multiSelectValue
    );
    let entities = values.filter(
      (_value: object) => _value !== this.multiSelectValue
    );
    if (multiSelect !== undefined) {
      if (entities.length === this.store.count) {
        entities = [];
      } else if (entities.length < this.store.count) {
        entities = this.store.all();
      }
    }

    entities = entities.filter((entity: object) => entity !== this.emptyValue);
    if (entities.length === 0) {
      this.store.state.updateAll({ selected: false });
    } else {
      this.store.state.updateMany(entities, { selected: true }, true);
    }

    const value = this.multi ? entities : event.value;
    this.selectedChange.emit({ selected: true, value });
  }

  private onSelectFromStore(entities: object[]) {
    if (this.multi === true) {
      this.selected$.next(entities);
    } else {
      const entity = entities.length > 0 ? entities[0] : undefined;
      this.selected$.next(entity);
    }

    this.updateMultiToggleWithEntities(entities);
  }

  private updateMultiToggleWithEntities(entities: object[]) {
    if (
      entities.length === this.store.count &&
      this.multiText$.value !== this.multiNoneText
    ) {
      this.multiText$.next(this.multiNoneText);
    } else if (
      entities.length < this.store.count &&
      this.multiText$.value !== this.multiAllText
    ) {
      this.multiText$.next(this.multiAllText);
    }
  }
}
