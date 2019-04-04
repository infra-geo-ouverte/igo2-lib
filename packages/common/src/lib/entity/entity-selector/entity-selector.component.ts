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
import { EntityStoreController } from '../shared/controller';
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
   * Store controller
   */
  private controller: EntityStoreController<object>;

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
   * Field placeholder
   */
  @Input() placeholder: string;

  /**
   * Event emitted when the selection changes
   */
  @Output() selectedChange = new EventEmitter<{
    selected: boolean;
    entity: object;
  }>();

  constructor(private cdRef: ChangeDetectorRef) {}

  /**
   * Create a store controller and subscribe to the selected entity
   * @internal
   */
  ngOnInit() {
    this.controller = new EntityStoreController(this.store, this.cdRef);
    this.selected$$ = this.store.stateView
      .firstBy$((record: EntityRecord<object>) => record.state.selected === true)
      .subscribe((record: EntityRecord<object>) => {
        this.selected$.next(record ? record.entity : undefined);
      });
  }

  /**
   * Unsubscribe to the selected entity and destroy the store controller
   * @internal
   */
  ngOnDestroy() {
    this.controller.destroy();
    this.selected$$.unsubscribe();
  }

  /**
   * On selection change, update the store's state and emit an event
   * @internal
   */
  onSelectionChange(event: {value: object | undefined}) {
    const entity = event.value;
    if (entity === undefined) {
      this.store.state.updateAll({selected: false});
    } else {
      this.store.state.update(entity, {selected: true}, true);
    }

    this.selectedChange.emit({selected: true, entity});
  }

}
