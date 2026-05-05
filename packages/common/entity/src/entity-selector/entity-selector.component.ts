import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  output
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
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule, AsyncPipe]
})
export class EntitySelectorComponent implements OnInit, OnDestroy {
  private cdRef = inject(ChangeDetectorRef);

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
  readonly store = input<EntityStore<object>>(undefined);

  /**
   * Title accessor
   */
  readonly titleAccessor = input<(object) => string>(getEntityTitle);

  /**
   * Text to display when nothing is selected
   */
  readonly emptyText = input<string>(undefined);

  /**
   * Wheter selecting many entities is allowed
   */
  readonly multi = input(false);

  /**
   * Text to display for the select all option
   */
  readonly multiAllText = input('All');

  /**
   * Text to display for the select none option
   */
  readonly multiNoneText = input('None');

  /**
   * Field placeholder
   */
  readonly placeholder = input<string>(undefined);

  /**
   * Wheter the selector is disabled or not
   */
  readonly disabled = input(false);

  /**
   * Event emitted when the selection changes
   */
  readonly selectedChange = output<EntitySelectorChange>();

  /**
   * Create a store watcher and subscribe to the selected entity
   * @internal
   */
  ngOnInit() {
    this.watcher = new EntityStoreWatcher(this.store(), this.cdRef);

    this.selected$$ = this.store()
      .stateView.manyBy$(
        (record: EntityRecord<object>) => record.state.selected === true
      )
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
    const store = this.store();
    if (multiSelect !== undefined) {
      if (entities.length === store.count) {
        entities = [];
      } else if (entities.length < store.count) {
        entities = store.all();
      }
    }

    entities = entities.filter((entity: object) => entity !== this.emptyValue);
    if (entities.length === 0) {
      store.state.updateAll({ selected: false });
    } else {
      store.state.updateMany(entities, { selected: true }, true);
    }

    const value = this.multi() ? entities : event.value;
    this.selectedChange.emit({ selected: true, value });
  }

  private onSelectFromStore(entities: object[]) {
    if (this.multi() === true) {
      this.selected$.next(entities);
    } else {
      const entity = entities.length > 0 ? entities[0] : undefined;
      this.selected$.next(entity);
    }

    this.updateMultiToggleWithEntities(entities);
  }

  private updateMultiToggleWithEntities(entities: object[]) {
    const store = this.store();
    const multiNoneText = this.multiNoneText();
    const multiAllText = this.multiAllText();
    if (
      entities.length === store.count &&
      this.multiText$.value !== multiNoneText
    ) {
      this.multiText$.next(multiNoneText);
    } else if (
      entities.length < store.count &&
      this.multiText$.value !== multiAllText
    ) {
      this.multiText$.next(multiAllText);
    }
  }
}
