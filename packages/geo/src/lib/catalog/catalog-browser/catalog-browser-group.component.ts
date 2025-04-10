import { AsyncPipe, NgFor, NgIf } from '@angular/common';
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
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CollapseDirective } from '@igo2/common/collapsible';
import type { EntityStateManager } from '@igo2/common/entity';
import { EntityStore } from '@igo2/common/entity';
import { ListItemDirective } from '@igo2/common/list';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject } from 'rxjs';

import { IgoMap } from '../../map/shared/map';
import {
  AddedChangeEmitter,
  AddedChangeGroupEmitter,
  Catalog,
  CatalogItem,
  CatalogItemGroup,
  CatalogItemState,
  CatalogItemType
} from '../shared';
import { CatalogBrowserLayerComponent } from './catalog-browser-layer.component';

/**
 * Catalog browser group item
 */
@Component({
  selector: 'igo-catalog-browser-group',
  templateUrl: './catalog-browser-group.component.html',
  styleUrls: ['./catalog-browser-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    CollapseDirective,
    MatTooltipModule,
    NgIf,
    MatButtonModule,
    NgFor,
    CatalogBrowserLayerComponent,
    ListItemDirective,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class CatalogBrowserGroupComponent implements OnInit, OnDestroy {
  /**
   * Group's items store
   * @internal
   */
  store = new EntityStore<CatalogItem, CatalogItemState>([]);

  /**
   * Whether all the layers of the group are added
   * @internal
   */
  added$ = new BehaviorSubject<boolean>(false);
  preview$ = new BehaviorSubject<boolean>(false);
  /**
   * Whether the toggle button is disabled
   * @internal
   */
  disabled$ = new BehaviorSubject<boolean>(false);

  /**
   * Catalog
   */
  @Input() catalog: Catalog;

  /**
   * Catalog group
   */
  @Input() group: CatalogItemGroup;

  @Input() map: IgoMap;

  /**
   * Whether the group is collapsed
   */
  @Input() collapsed = true;

  @Input() resolution: number;

  @Input() catalogAllowLegend = false;

  /**
   * Whether the group can be toggled when it's collapsed
   */
  @Input() toggleCollapsed = true;

  /**
   * Parent catalog's items store state. Groups share a unique
   * EntityState that tracks the group and it's layers state (whether they are added or not).
   * Sharing a unique state would also allow us to expand this component to allow
   * the selection of a layer while unselecting any layer already selected in another group.
   * This could be useful to display some layer info before adding it, for example.
   */
  @Input() state: EntityStateManager<CatalogItem, CatalogItemState>;

  /**
   * Event emitted when the add/remove button of the group is clicked
   */
  @Output() addedChange = new EventEmitter<AddedChangeGroupEmitter>();

  /**
   * Event emitted when the add/remove button of a layer is clicked
   */
  @Output() layerAddedChange = new EventEmitter<AddedChangeEmitter>();

  /**
   * @internal
   */
  get title(): string {
    return this.group.title;
  }

  /**
   * @internal
   */
  ngOnInit() {
    this.store.load(this.group.items);
    this.evaluateAdded();
    this.evaluateDisabled(this.collapsed);
    if (this.group.sortDirection !== undefined) {
      this.store.view.sort({
        direction: this.group.sortDirection,
        valueAccessor: (item: CatalogItem) => item.title
      });
    }
  }

  ngOnDestroy() {
    this.store.destroy();
  }

  /**
   * @internal
   */
  isGroup(item: CatalogItem): boolean {
    return item.type === CatalogItemType.Group;
  }

  /**
   * @internal
   */
  isLayer(item: CatalogItem): boolean {
    return item.type === CatalogItemType.Layer;
  }

  /**
   * On toggle button click, emit the added change event
   * @internal
   */
  onToggleClick(event: Event) {
    this.added$.value ? this.remove(event) : this.add(event);
  }

  /**
   * On toggle button click, emit the added change event
   * @internal
   */
  onToggleCollapsed(collapsed: boolean) {
    this.evaluateDisabled(collapsed);
  }

  /**
   * When a layer is added or removed, evaluate if all the layers of the group
   * are now added or removed. If so, consider that the group itself is added
   * or removed.
   * @internal
   * @param event Layer added change event
   */
  onLayerAddedChange(event: AddedChangeEmitter) {
    this.layerAddedChange.emit(event);
    this.tryToggleGroup(event);
  }

  /**
   * Emit added change event with added = true
   */
  private add(event: Event) {
    this.added$.next(true);
    this.addedChange.emit({
      added: true,
      group: this.group,
      event
    });
  }

  /**
   * Emit added change event with added = true
   */
  private remove(event: Event) {
    this.added$.next(false);
    this.addedChange.emit({
      added: false,
      group: this.group,
      event
    });
  }

  onLayerPreview(event) {
    this.preview$.next(event);
  }

  /**
   * If all the layers of the group added or removed, add or remove the group itself.
   * @param event The last layer added change event to occur
   */
  private tryToggleGroup(event: AddedChangeEmitter) {
    const added = event.added;
    const layer = event.layer;

    const layersAdded = this.store.view
      .all()
      .filter((item: CatalogItem) => item.id !== layer.id)
      .map((item: CatalogItem) => this.state.get(item).added || false);

    if (layersAdded.every((value) => value === added)) {
      added ? this.add(event.event) : this.remove(event.event);
    } else if (this.added$.value === true) {
      this.added$.next(false);
    }
  }

  private evaluateAdded() {
    const added = this.store.all().every((item: CatalogItem) => {
      return (this.state.get(item).added || false) === true;
    });
    this.added$.next(added);
  }

  private evaluateDisabled(collapsed: boolean) {
    let disabled = false;
    if (this.toggleCollapsed === false) {
      disabled = collapsed;
    }
    this.disabled$.next(disabled);
  }

  onTitleClick() {
    this.collapsed = !this.collapsed;
  }
}
